import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';
import { seedIfEmpty, syncContentCopy } from './seed.js';
import { authRouter } from './routes/auth.js';
import { coursesRouter } from './routes/courses.js';
import { lessonsRouter } from './routes/lessons.js';
import { exercisesRouter } from './routes/exercises.js';
import { progressRouter } from './routes/progress.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin.js';
import { authRequired } from './middleware/auth.js';
import {
  CourseCompletion,
  Enrollment,
  LessonProgress,
  User,
  toPlain,
} from './models/index.js';
import { getAiProviderStatus } from './services/ai.js';
import { attachClientCache } from './middleware/staticCache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3847);

const app = express();
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '30d',
    immutable: true,
    etag: true,
    lastModified: true,
  })
);

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, name: 'Somali AI Learning Tutor', ai: getAiProviderStatus() });
});

app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

app.get('/api/profile', authRequired, async (req, res) => {
  const studentId = req.user!.id;
  const user =
    (await User.findById(studentId).lean()) ||
    (await User.findOne({ email: req.user!.email.toLowerCase() }).lean());
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const userOut = toPlain(user);
  delete userOut.password;

  if (user.role === 'STUDENT') {
    const [enrolled, completed, lessons] = await Promise.all([
      Enrollment.countDocuments({ student_id: studentId }),
      CourseCompletion.countDocuments({ student_id: studentId }),
      LessonProgress.countDocuments({ student_id: studentId, completed: true }),
    ]);
    return res.json({
      user: userOut,
      profile: {
        enrolledCourses: enrolled,
        completedCourses: completed,
        lessonsCompleted: lessons,
        joinedAt: userOut.created_at,
      },
    });
  }

  res.json({ user: userOut, profile: { joinedAt: userOut.created_at } });
});

app.patch('/api/profile', authRequired, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body as {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (trimmed.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }
    user.name = trimmed;
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password.' });
    }
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    user.password = bcrypt.hashSync(String(newPassword), 10);
  }

  await user.save();
  const userOut = toPlain(user.toObject());
  delete (userOut as Record<string, unknown>).password;

  res.json({
    user: userOut,
    message: 'Profile updated successfully.',
  });
});

const servingClient = attachClientCache(app);

async function start() {
  await connectDb();
  await seedIfEmpty();
  await syncContentCopy();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Somali AI Tutor API running on http://0.0.0.0:${PORT}`);
    if (servingClient) {
      console.log(`Serving cached production frontend from client/dist on port ${PORT}`);
    } else {
      console.log('Dev mode: run client with npm run dev:client (Vite on port 3850)');
    }
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
