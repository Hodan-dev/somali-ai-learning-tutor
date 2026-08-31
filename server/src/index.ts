import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
  const user = await User.findById(req.user!.id).lean();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const userOut = toPlain(user);

  if (user.role === 'STUDENT') {
    const [enrolled, completed, lessons] = await Promise.all([
      Enrollment.countDocuments({ student_id: user.id }),
      CourseCompletion.countDocuments({ student_id: user.id }),
      LessonProgress.countDocuments({ student_id: user.id, completed: true }),
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
