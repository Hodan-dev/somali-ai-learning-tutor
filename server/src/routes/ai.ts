import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { db } from '../db.js';
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
    return res.status(400).json({ error: 'Fariin lama helin. Su\'aal waa inay ahaataa 1–2000 xaraf.' });
  }

  try {
    let chatId = parsed.data.chatId;
    if (!chatId) {
      chatId = uuid();
      db.prepare(
        `INSERT INTO chat_sessions (id, student_id, course_id, lesson_id, exercise_id) VALUES (?, ?, ?, ?, ?)`
      ).run(
        chatId,
        req.user!.id,
        parsed.data.courseId || null,
        parsed.data.lessonId || null,
        parsed.data.exerciseId || null
      );
    }

    db.prepare(`INSERT INTO chat_messages (id, chat_id, sender, message) VALUES (?, ?, 'student', ?)`).run(
      uuid(),
      chatId,
      parsed.data.message
    );

    let lessonTitle: string | undefined;
    let courseTitle: string | undefined;
    let lessonContent: string | undefined;
    let contextChunks: string[] = [];

    if (parsed.data.lessonId) {
      const lesson = db
        .prepare(
          `SELECT l.title, l.content, l.description, l.pdf_url, c.title as course_title
           FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
           WHERE l.id = ?`
        )
        .get(parsed.data.lessonId) as
        | { title: string; content: string; description: string; pdf_url: string | null; course_title: string }
        | undefined;

      if (lesson) {
        lessonTitle = lesson.title;
        courseTitle = lesson.course_title;
        lessonContent = lesson.pdf_url
          ? lesson.description || lesson.title
          : lesson.content;
      }

      if (!lesson?.pdf_url) {
        const chunks = db
          .prepare(`SELECT id, content FROM lesson_chunks WHERE lesson_id = ? ORDER BY chunk_index`)
          .all(parsed.data.lessonId) as { id: string; content: string }[];

        contextChunks = retrieveRelevantChunks(chunks, parsed.data.message);
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

    db.prepare(`INSERT INTO chat_messages (id, chat_id, sender, message) VALUES (?, ?, 'ai', ?)`).run(
      uuid(),
      chatId,
      reply
    );

    return res.json({ chatId, reply });
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(500).json({
      error: 'Macallinka AI ma jawaabi karo hadda. Fadlan isku day mar kale.',
    });
  }
});

aiRouter.get('/history', authRequired, requireRole('STUDENT'), (req, res) => {
  try {
    const lessonId = req.query.lessonId as string | undefined;
    let session: { id: string } | undefined;

    if (lessonId) {
      session = db
        .prepare(
          `SELECT id FROM chat_sessions WHERE student_id = ? AND lesson_id = ? ORDER BY created_at DESC LIMIT 1`
        )
        .get(req.user!.id, lessonId) as { id: string } | undefined;
    } else {
      session = db
        .prepare(`SELECT id FROM chat_sessions WHERE student_id = ? ORDER BY created_at DESC LIMIT 1`)
        .get(req.user!.id) as { id: string } | undefined;
    }

    if (!session) return res.json({ chatId: null, messages: [] });

    const messages = db
      .prepare(`SELECT sender, message, created_at FROM chat_messages WHERE chat_id = ? ORDER BY created_at`)
      .all(session.id);

    return res.json({ chatId: session.id, messages });
  } catch (err) {
    console.error('AI history error:', err);
    return res.status(500).json({ error: 'Taariikhda chat-ka lama soo dejin karo.' });
  }
});

aiRouter.delete('/history', authRequired, requireRole('STUDENT'), (req, res) => {
  const chatId = req.query.chatId as string | undefined;
  if (!chatId) return res.status(400).json({ error: 'chatId required' });

  try {
    const session = db
      .prepare(`SELECT id FROM chat_sessions WHERE id = ? AND student_id = ?`)
      .get(chatId, req.user!.id);
    if (!session) return res.status(404).json({ error: 'Chat lama helin.' });

    db.prepare(`DELETE FROM chat_messages WHERE chat_id = ?`).run(chatId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('AI history delete error:', err);
    return res.status(500).json({ error: 'Chat lama tirtiri karo.' });
  }
});
