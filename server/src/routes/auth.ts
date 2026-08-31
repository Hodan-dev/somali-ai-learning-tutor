import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { Course, Enrollment, User, mapId } from '../models/index.js';
import { authRequired, signToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
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
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'Email-kan horey ayaa loo isticmaalay.' });
  }
  const id = uuid();
  await User.create({
    _id: id,
    name,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    role: 'STUDENT',
  });

  const courses = await Course.find().select('_id').lean();
  if (courses.length) {
    await Enrollment.insertMany(
      courses.map((c) => ({ student_id: id, course_id: c._id }))
    );
  }

  const user = { id, name, email: email.toLowerCase(), role: 'STUDENT' as const };
  res.status(201).json({ token: signToken(user), user });
});

authRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email iyo password ayaa loo baahan yahay.' });
  }
  const row = await User.findOne({ email: parsed.data.email.toLowerCase() }).lean();
  if (!row || !bcrypt.compareSync(parsed.data.password, row.password)) {
    return res.status(401).json({ error: 'Email ama password waa khalad.' });
  }
  const user = { id: row._id, name: row.name, email: row.email, role: row.role as 'ADMIN' | 'STUDENT' };
  res.json({ token: signToken(user), user });
});

authRouter.post('/logout', authRequired, (_req, res) => {
  res.json({ ok: true });
});

authRouter.get('/me', authRequired, async (req, res) => {
  const row = await User.findById(req.user!.id).lean();
  res.json({ user: row ? mapId(row) : null });
});
