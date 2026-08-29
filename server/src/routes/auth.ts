import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { db } from '../db.js';
import { authRequired, signToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Macluumaadka ma saxna. Hubi magaca, email, iyo password (ugu yaraan 6).' });
  }
  const { name, email, password } = parsed.data;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email-kan horey ayaa loo isticmaalay.' });
  }
  const id = uuid();
  db.prepare(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'STUDENT')`
  ).run(id, name, email.toLowerCase(), bcrypt.hashSync(password, 10));

  // Auto-enroll in all courses
  const courses = db.prepare('SELECT id FROM courses').all() as { id: string }[];
  const enroll = db.prepare(`INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)`);
  for (const c of courses) enroll.run(uuid(), id, c.id);

  const user = { id, name, email: email.toLowerCase(), role: 'STUDENT' as const };
  const token = signToken(user);
  res.status(201).json({ token, user });
});

authRouter.post('/login', (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email iyo password ayaa loo baahan yahay.' });
  }
  const row = db
    .prepare('SELECT id, name, email, password, role FROM users WHERE email = ?')
    .get(parsed.data.email.toLowerCase()) as
    | { id: string; name: string; email: string; password: string; role: 'ADMIN' | 'STUDENT' }
    | undefined;

  if (!row || !bcrypt.compareSync(parsed.data.password, row.password)) {
    return res.status(401).json({ error: 'Email ama password waa khalad.' });
  }
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  res.json({ token: signToken(user), user });
});

authRouter.post('/logout', authRequired, (_req, res) => {
  res.json({ ok: true });
});

authRouter.get('/me', authRequired, (req, res) => {
  const row = db
    .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
    .get(req.user!.id);
  res.json({ user: row });
});
