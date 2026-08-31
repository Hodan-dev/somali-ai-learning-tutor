import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  ChatMessage,
  ChatSession,
  Course,
  Lesson,
  LessonChunk,
  Module,
} from '../models/index.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { generateTutorReply, retrieveRelevantChunks } from '../services/ai.js';

export const aiRouter = Router();

aiRouter.post('/chat', authRequired, requireRole('STUDENT'), async (req, res) => {
  const schema = z.object({
    message: z.string().trim().min(1).max(2000),
    chatId: z.string().nullish(),
    courseId: z.string().nullish(),
    lessonId: z.string().nullish(),
    exerciseId: z.string().nullish(),
    exerciseHint: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Fariin lama helin. Su'aal waa inay ahaataa 1–2000 xaraf." });
  }

  try {
    let chatId = parsed.data.chatId;
    if (!chatId) {
      chatId = uuid();
      await ChatSession.create({
        _id: chatId,
        student_id: req.user!.id,
        course_id: parsed.data.courseId || undefined,
        lesson_id: parsed.data.lessonId || undefined,
        exercise_id: parsed.data.exerciseId || undefined,
      });
    }

    await ChatMessage.create({
      chat_id: chatId,
      sender: 'student',
      message: parsed.data.message,
    });

    let lessonTitle: string | undefined;
    let courseTitle: string | undefined;
    let lessonContent: string | undefined;
    let contextChunks: string[] = [];

    if (parsed.data.lessonId) {
      const lesson = await Lesson.findById(parsed.data.lessonId).lean();
      if (lesson) {
        const mod = await Module.findById(lesson.module_id).lean();
        const course = mod ? await Course.findById(mod.course_id).lean() : null;
        lessonTitle = lesson.title;
        courseTitle = course?.title;
        lessonContent = lesson.pdf_url ? lesson.description || lesson.title : lesson.content;
      }

      if (!lesson?.pdf_url) {
        const chunks = await LessonChunk.find({ lesson_id: parsed.data.lessonId }).sort({ chunk_index: 1 }).lean();
        contextChunks = retrieveRelevantChunks(
          chunks.map((c) => ({ id: c._id, content: c.content })),
          parsed.data.message
        );
      }
    }

    const reply = await generateTutorReply({
      question: parsed.data.message,
      lessonTitle,
      courseTitle,
      lessonContent,
      contextChunks,
      exerciseHint: parsed.data.exerciseHint,
    });

    await ChatMessage.create({
      chat_id: chatId,
      sender: 'ai',
      message: reply,
    });

    return res.json({ chatId, reply });
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(500).json({
      error: 'Macallinka AI ma jawaabi karo hadda. Fadlan isku day mar kale.',
    });
  }
});

aiRouter.get('/history', authRequired, requireRole('STUDENT'), async (req, res) => {
  try {
    const lessonId = req.query.lessonId as string | undefined;
    const filter: Record<string, string> = { student_id: req.user!.id };
    if (lessonId) filter.lesson_id = lessonId;

    const session = await ChatSession.findOne(filter).sort({ created_at: -1 }).lean();
    if (!session) return res.json({ chatId: null, messages: [] });

    const messages = await ChatMessage.find({ chat_id: session._id }).sort({ created_at: 1 }).lean();
    return res.json({
      chatId: session._id,
      messages: messages.map((m) => ({
        sender: m.sender,
        message: m.message,
        created_at: m.created_at instanceof Date ? m.created_at.toISOString() : m.created_at,
      })),
    });
  } catch (err) {
    console.error('AI history error:', err);
    return res.status(500).json({ error: 'Taariikhda chat-ka lama soo dejin karo.' });
  }
});

aiRouter.delete('/history', authRequired, requireRole('STUDENT'), async (req, res) => {
  const chatId = req.query.chatId as string | undefined;
  if (!chatId) return res.status(400).json({ error: 'chatId required' });

  try {
    const session = await ChatSession.findOne({ _id: chatId, student_id: req.user!.id });
    if (!session) return res.status(404).json({ error: 'Chat lama helin.' });

    await ChatMessage.deleteMany({ chat_id: chatId });
    return res.json({ ok: true });
  } catch (err) {
    console.error('AI history delete error:', err);
    return res.status(500).json({ error: 'Chat lama tirtiri karo.' });
  }
});
