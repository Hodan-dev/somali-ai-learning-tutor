import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuid } from 'uuid';

const opts = { versionKey: false } as const;
const stringId = { type: String, default: () => uuid() };

const userSchema = new Schema(
  {
    _id: stringId,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['ADMIN', 'STUDENT'] },
    created_at: { type: Date, default: Date.now },
  },
  opts
);

const courseSchema = new Schema(
  {
    _id: stringId,
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    thumbnail: String,
    sequential: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  opts
);

const moduleSchema = new Schema(
  {
    _id: stringId,
    course_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    sort_order: { type: Number, default: 0 },
  },
  opts
);

const lessonSchema = new Schema(
  {
    _id: stringId,
    module_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    pdf_url: String,
    sort_order: { type: Number, default: 0 },
    status: { type: String, default: 'published' },
    uploaded_by: String,
    created_at: { type: Date, default: Date.now },
  },
  opts
);

const lessonChunkSchema = new Schema(
  {
    _id: stringId,
    lesson_id: { type: String, required: true, index: true },
    content: { type: String, required: true },
    chunk_index: { type: Number, default: 0 },
  },
  opts
);

const exerciseSchema = new Schema(
  {
    _id: stringId,
    lesson_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  opts
);

const questionSchema = new Schema(
  {
    _id: stringId,
    exercise_id: { type: String, required: true, index: true },
    question: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'code'],
    },
    options: [String],
    correct_answer: { type: String, required: true },
    explanation: { type: String, default: '' },
    hint: { type: String, default: '' },
    points: { type: Number, default: 10 },
    sort_order: { type: Number, default: 0 },
  },
  opts
);

const enrollmentSchema = new Schema(
  {
    _id: stringId,
    student_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    enrolled_at: { type: Date, default: Date.now },
  },
  opts
);
enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

const lessonProgressSchema = new Schema(
  {
    _id: stringId,
    student_id: { type: String, required: true, index: true },
    lesson_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false },
    last_accessed: { type: Date, default: Date.now },
    completed_at: Date,
  },
  opts
);
lessonProgressSchema.index({ student_id: 1, lesson_id: 1 }, { unique: true });

const exerciseAttemptSchema = new Schema(
  {
    _id: stringId,
    student_id: { type: String, required: true, index: true },
    exercise_id: { type: String, required: true, index: true },
    question_id: { type: String, required: true, index: true },
    answer: { type: String, required: true },
    is_correct: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    attempt_number: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now },
  },
  opts
);

const courseCompletionSchema = new Schema(
  {
    _id: stringId,
    student_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    final_score: { type: Number, default: 0 },
    completed_at: { type: Date, default: Date.now },
  },
  opts
);
courseCompletionSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

const chatSessionSchema = new Schema(
  {
    _id: stringId,
    student_id: { type: String, required: true, index: true },
    course_id: String,
    lesson_id: String,
    exercise_id: String,
    created_at: { type: Date, default: Date.now },
  },
  opts
);

const chatMessageSchema = new Schema(
  {
    _id: stringId,
    chat_id: { type: String, required: true, index: true },
    sender: { type: String, required: true, enum: ['student', 'ai'] },
    message: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  opts
);

const activityLogSchema = new Schema(
  {
    _id: stringId,
    student_id: { type: String, required: true, index: true },
    action: { type: String, required: true },
    detail: String,
    created_at: { type: Date, default: Date.now },
  },
  opts
);

export const User = model('User', userSchema);
export const Course = model('Course', courseSchema);
export const Module = model('Module', moduleSchema);
export const Lesson = model('Lesson', lessonSchema);
export const LessonChunk = model('LessonChunk', lessonChunkSchema);
export const Exercise = model('Exercise', exerciseSchema);
export const Question = model('Question', questionSchema);
export const Enrollment = model('Enrollment', enrollmentSchema);
export const LessonProgress = model('LessonProgress', lessonProgressSchema);
export const ExerciseAttempt = model('ExerciseAttempt', exerciseAttemptSchema);
export const CourseCompletion = model('CourseCompletion', courseCompletionSchema);
export const ChatSession = model('ChatSession', chatSessionSchema);
export const ChatMessage = model('ChatMessage', chatMessageSchema);
export const ActivityLog = model('ActivityLog', activityLogSchema);

type WithId = { _id: string; created_at?: Date; enrolled_at?: Date; completed_at?: Date; last_accessed?: Date };

export function mapId<T extends WithId>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id } as Omit<T, '_id'> & { id: string };
}

export function toPlain<T extends WithId>(doc: T): Record<string, unknown> {
  const mapped = mapId(doc);
  const out: Record<string, unknown> = { ...mapped };
  for (const key of ['created_at', 'enrolled_at', 'completed_at', 'last_accessed'] as const) {
    const val = out[key];
    if (val instanceof Date) out[key] = val.toISOString();
  }
  return out;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
