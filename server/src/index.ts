import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedIfEmpty, syncContentCopy } from './seed.js';
import { authRouter } from './routes/auth.js';
import { coursesRouter } from './routes/courses.js';
import { lessonsRouter } from './routes/lessons.js';
import { exercisesRouter } from './routes/exercises.js';
import { progressRouter } from './routes/progress.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin.js';
import { authRequired } from './middleware/auth.js';
import { db } from './db.js';
import { getAiProviderStatus } from './services/ai.js';
import { attachClientCache } from './middleware/staticCache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3847);

seedIfEmpty();
syncContentCopy();

const app = express();
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '7d',
    etag: true,
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

app.get('/api/profile', authRequired, (req, res) => {
  const user = db
    .prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`)
    .get(req.user!.id) as { id: string; name: string; email: string; role: string; created_at: string };

  if (user.role === 'STUDENT') {
    const enrolled = db
      .prepare(
        `SELECT COUNT(*) as c FROM enrollments WHERE student_id = ?`
      )
      .get(user.id) as { c: number };
    const completed = db
      .prepare(`SELECT COUNT(*) as c FROM course_completions WHERE student_id = ?`)
      .get(user.id) as { c: number };
    const lessons = db
      .prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE student_id = ? AND completed = 1`)
      .get(user.id) as { c: number };
    return res.json({
      user,
      profile: {
        enrolledCourses: enrolled.c,
        completedCourses: completed.c,
        lessonsCompleted: lessons.c,
        joinedAt: user.created_at,
      },
    });
  }

  res.json({ user, profile: { joinedAt: user.created_at } });
});

const servingClient = attachClientCache(app);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Somali AI Tutor API running on http://0.0.0.0:${PORT}`);
  if (servingClient) {
    console.log(`Serving cached production frontend from client/dist on port ${PORT}`);
  } else {
    console.log('Dev mode: run client with npm run dev:client (Vite on port 3850)');
  }
});
