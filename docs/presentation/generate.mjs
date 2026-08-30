/**
 * Somali-AI-Tutor — presentation generator
 * Run: node docs/presentation/generate.mjs
 */
import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, 'Somali-AI-Tutor-Presentation.pptx');

const BLUE = '2563EB';
const BLUE_DARK = '1E3A8A';
const BLUE_LIGHT = 'DBEAFE';
const INK = '0F172A';
const MUTED = '64748B';
const WHITE = 'FFFFFF';
const SLATE = 'F8FAFC';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'Somali AI Learning Tutor';
pptx.title = 'Somali-AI-Tutor — Project Presentation';
pptx.subject = 'Interactive AI Learning Tutor for Somali Students';

function addFooter(slide, n, total = 17) {
  slide.addText(`Somali-AI-Tutor  ·  ${n}/${total}`, {
    x: 0.5,
    y: 7.1,
    w: 12.3,
    h: 0.28,
    fontSize: 11,
    color: MUTED,
    fontFace: 'Calibri',
  });
}

function sectionBar(slide, title) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.12,
    fill: { color: BLUE },
    line: { color: BLUE },
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 12.2,
    h: 0.55,
    fontSize: 28,
    bold: true,
    color: BLUE_DARK,
    fontFace: 'Calibri',
  });
}

function bulletBlock(slide, items, opts = {}) {
  const {
    x = 0.55,
    y = 1.15,
    w = 12.2,
    h = 5.5,
    fontSize = 18,
  } = opts;
  slide.addText(
    items.map((t) => ({
      text: t,
      options: { bullet: true, breakLine: true, color: INK, fontSize, fontFace: 'Calibri', paraSpaceAfter: 10 },
    })),
    { x, y, w, h, valign: 'top' }
  );
}

// ─── Slide 1: Title ─────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color: BLUE_DARK },
  });
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 5.9, w: 13.333, h: 1.6,
    fill: { color: BLUE },
  });
  s.addText('Somali-AI-Tutor', {
    x: 0.7, y: 2.0, w: 12, h: 0.8,
    fontSize: 44, bold: true, color: WHITE, fontFace: 'Calibri',
  });
  s.addText('Interactive AI Learning Tutor for Somali Students', {
    x: 0.7, y: 2.85, w: 12, h: 0.5,
    fontSize: 22, color: BLUE_LIGHT, fontFace: 'Calibri',
  });
  s.addText('Learn  →  Practice  →  Ask AI  →  Improve  →  Track  →  Complete', {
    x: 0.7, y: 3.55, w: 12, h: 0.4,
    fontSize: 16, color: 'BFDBFE', fontFace: 'Calibri',
  });
  s.addText('Student / Presenter Name\nUniversity / Program\nAugust 2026', {
    x: 0.7, y: 6.15, w: 12, h: 1.1,
    fontSize: 16, color: WHITE, fontFace: 'Calibri',
  });
}

// ─── Slide 2: Problem ───────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'The Problem');
  bulletBlock(s, [
    'Somali students have limited access to interactive digital learning resources.',
    'Students often study subjects without immediate guidance or feedback.',
    'Difficult concepts in STEM and English can be hard to understand independently.',
    'There is a lack of Somali-friendly AI educational support.',
    'Existing platforms rarely combine lessons, exercises, progress tracking, and an AI tutor in one place.',
  ]);
  addFooter(s, 2);
}

// ─── Slide 3: Solution ──────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Proposed Solution');
  bulletBlock(s, [
    'A web-based interactive learning platform for Somali students.',
    'Structured lessons for Mathematics, Physics, Chemistry, Biology, and English.',
    'Practice exercises with instant feedback, hints, and retry.',
    'AI Tutor chatbot that answers questions using lesson context (Somali-friendly).',
    'Progress tracking so students can see what they completed and what remains.',
    'Admin tools to manage courses, lessons (including PDF upload), and student progress.',
  ], { y: 1.1, h: 5.6, fontSize: 17 });
  addFooter(s, 3);
}

// ─── Slide 4: Features ──────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Main Features');

  const cards = [
    { t: 'Auth', d: 'Register / login\nStudent & Admin roles\nJWT sessions' },
    { t: 'Learning', d: '5 subjects\nModules & lessons\nCurriculum layout' },
    { t: 'Exercises', d: 'MCQ / T-F / short\nHints & feedback\nRetry support' },
    { t: 'AI Tutor', d: 'Gemini-powered\nLesson-aware chat\nSomali guidance' },
    { t: 'Progress', d: 'Per-course %\nActivity log\nContinue learning' },
    { t: 'Admin', d: 'Courses & modules\nPDF / text lessons\nStudent overview' },
  ];
  cards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.55 + col * 4.15;
    const y = 1.2 + row * 2.7;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 3.9, h: 2.4,
      fill: { color: SLATE },
      line: { color: BLUE_LIGHT },
      rectRadius: 0.12,
    });
    s.addText(c.t, {
      x: x + 0.2, y: y + 0.25, w: 3.5, h: 0.45,
      fontSize: 20, bold: true, color: BLUE_DARK, fontFace: 'Calibri',
    });
    s.addText(c.d, {
      x: x + 0.2, y: y + 0.8, w: 3.5, h: 1.4,
      fontSize: 15, color: INK, fontFace: 'Calibri',
    });
  });
  addFooter(s, 4);
}

// ─── Slide 5: Technologies ──────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Technologies Used');

  const cols = [
    { h: 'Frontend', items: ['React + TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'PWA (service worker)'] },
    { h: 'Backend', items: ['Node.js', 'Express.js', 'JWT + bcrypt', 'Multer (PDF upload)', 'Gzip compression'] },
    { h: 'Data & AI', items: ['SQLite (Better SQLite3)', 'Google Gemini API', '@google/genai SDK', 'In-memory API cache', 'Lesson chunk context'] },
    { h: 'Testing', items: ['Browser UI testing', 'API / health checks', 'Auth flow tests', 'AI chat validation', 'Error / empty states'] },
  ];
  cols.forEach((col, i) => {
    const x = 0.45 + i * 3.2;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.15, w: 3.05, h: 5.4,
      fill: { color: i % 2 === 0 ? SLATE : BLUE_LIGHT },
      line: { color: BLUE_LIGHT },
      rectRadius: 0.1,
    });
    s.addText(col.h, {
      x: x + 0.15, y: 1.35, w: 2.75, h: 0.45,
      fontSize: 18, bold: true, color: BLUE_DARK, fontFace: 'Calibri',
    });
    s.addText(
      col.items.map((t) => ({
        text: t,
        options: { bullet: true, breakLine: true, fontSize: 14, color: INK, fontFace: 'Calibri', paraSpaceAfter: 8 },
      })),
      { x: x + 0.15, y: 1.95, w: 2.75, h: 4.3 }
    );
  });
  addFooter(s, 5);
}

// ─── Slide 6: Architecture ──────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'System Architecture');

  const boxes = [
    { x: 5.1, y: 1.15, t: 'Student / Admin', c: BLUE_DARK },
    { x: 5.1, y: 2.15, t: 'React + Vite Frontend', c: BLUE },
    { x: 5.1, y: 3.15, t: 'Node.js + Express API', c: BLUE },
  ];
  boxes.forEach((b) => {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: b.x, y: b.y, w: 3.2, h: 0.7,
      fill: { color: b.c }, rectRadius: 0.08,
    });
    s.addText(b.t, {
      x: b.x, y: b.y, w: 3.2, h: 0.7,
      fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Calibri',
    });
  });
  // arrows down
  [1.85, 2.85].forEach((y) => {
    s.addText('↓', { x: 6.4, y, w: 0.6, h: 0.3, fontSize: 18, color: MUTED, align: 'center' });
  });

  const lower = [
    { x: 1.2, y: 4.3, t: 'SQLite\nPermanent data', c: BLUE_DARK },
    { x: 5.1, y: 4.3, t: 'Memory Cache + PWA\nFast temporary data', c: BLUE },
    { x: 9.0, y: 4.3, t: 'Gemini API\nAI Tutor', c: BLUE_DARK },
  ];
  lower.forEach((b) => {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: b.x, y: b.y, w: 3.2, h: 1.2,
      fill: { color: b.c }, rectRadius: 0.08,
    });
    s.addText(b.t, {
      x: b.x, y: b.y, w: 3.2, h: 1.2,
      fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Calibri',
    });
  });
  s.addText('↓', { x: 6.4, y: 3.85, w: 0.6, h: 0.35, fontSize: 18, color: MUTED, align: 'center' });
  s.addText('API key stays on the server (.env). Frontend never talks to Gemini directly.', {
    x: 0.55, y: 5.85, w: 12.2, h: 0.45,
    fontSize: 15, color: MUTED, fontFace: 'Calibri',
  });
  s.addText('Note: Implemented with SQLite + in-memory/PWA caching (not MongoDB/Redis).', {
    x: 0.55, y: 6.35, w: 12.2, h: 0.35,
    fontSize: 13, italic: true, color: MUTED, fontFace: 'Calibri',
  });
  addFooter(s, 6);
}

// ─── Slide 7: AI Tutor ──────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'AI Tutor Flow');
  const steps = [
    '1. Student asks a question in the lesson AI panel or Tutor page.',
    '2. React sends POST /api/ai/chat to the Express backend (with JWT).',
    '3. Backend loads lesson context / chunks from SQLite.',
    '4. Backend calls Google Gemini via @google/genai (key from .env).',
    '5. Gemini returns an educational, Somali-friendly explanation.',
    '6. Backend returns the answer to the student UI.',
    '7. If Gemini is unavailable, a local Somali tutor fallback still replies.',
  ];
  bulletBlock(s, steps, { fontSize: 17, y: 1.15 });
  addFooter(s, 7);
}

// ─── Slide 8: Health & Monitoring ───────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Application Health & Monitoring');
  bulletBlock(s, [
    'Backend status checked via GET /api/health',
    'Health response reports: ok, app name, AI provider, SDK, configured flag, model',
    'Example: { "ok": true, "ai": { "provider": "google-ai-studio", "configured": true } }',
    'Auth routes verify JWT and role (STUDENT / ADMIN).',
    'API errors return clear status codes without leaking secrets.',
    'Gemini overload: retry with fallback model when needed.',
    'Frontend covers loading, empty, and error UI states.',
  ], { fontSize: 16, y: 1.1 });
  addFooter(s, 8);
}

// ─── Slide 9: SRS / Spec ────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Specification (SRS Highlights)');

  const left = [
    'Functional requirements',
    'Register / login / logout',
    'Browse 5 subject courses',
    'Complete lessons & exercises',
    'Ask AI Tutor with context',
    'Track progress per course',
    'Admin content management',
  ];
  const right = [
    'Non-functional & roles',
    'Roles: STUDENT, ADMIN',
    'Secure JWT authentication',
    'API key never in frontend',
    'Responsive web UI',
    'Fast load (cache + lazy routes)',
    'Somali-friendly UX & copy',
  ];
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.55, y: 1.2, w: 5.9, h: 5.3,
    fill: { color: SLATE }, line: { color: BLUE_LIGHT }, rectRadius: 0.1,
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.85, y: 1.2, w: 5.9, h: 5.3,
    fill: { color: BLUE_LIGHT }, line: { color: BLUE_LIGHT }, rectRadius: 0.1,
  });
  s.addText(
    left.map((t, i) => ({
      text: t,
      options: { bullet: i > 0, breakLine: true, bold: i === 0, fontSize: i === 0 ? 18 : 15, color: INK, fontFace: 'Calibri', paraSpaceAfter: 8 },
    })),
    { x: 0.8, y: 1.45, w: 5.4, h: 4.8 }
  );
  s.addText(
    right.map((t, i) => ({
      text: t,
      options: { bullet: i > 0, breakLine: true, bold: i === 0, fontSize: i === 0 ? 18 : 15, color: INK, fontFace: 'Calibri', paraSpaceAfter: 8 },
    })),
    { x: 7.1, y: 1.45, w: 5.4, h: 4.8 }
  );
  addFooter(s, 9);
}

// ─── Slide 10: Session & Caching ────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Session Management & Caching');
  bulletBlock(s, [
    'Sessions: JWT tokens (7-day expiry) stored client-side; verified on protected API routes.',
    'Passwords hashed with bcrypt — never stored in plain text.',
    'In-memory API cache for course list/detail (X-Cache: HIT) to reduce DB work.',
    'PWA service worker caches JS/CSS/fonts for faster repeat visits.',
    'Gzip compression on API responses.',
    'Lazy-loaded React routes shrink the first page load.',
    'SQLite holds permanent data (users, courses, lessons, progress, chats).',
  ], { fontSize: 16 });
  addFooter(s, 10);
}

// ─── Slide 11: Testing ──────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Testing Overview');

  s.addTable(
    [
      [
        { text: 'Area', options: { bold: true, color: WHITE, fill: { color: BLUE_DARK } } },
        { text: 'What was tested', options: { bold: true, color: WHITE, fill: { color: BLUE_DARK } } },
      ],
      ['Authentication', 'Login, register, demo accounts, role routing'],
      ['API', 'Health, courses, lessons, exercises, AI chat, progress'],
      ['Database', 'CRUD for courses/lessons; progress writes; enrollments'],
      ['AI Tutor', 'Chat replies, chatId null case, Gemini fallback'],
      ['Caching', 'Course list HIT/MISS, production static cache'],
      ['Frontend', 'Landing, dashboard, lesson layout, mobile layout'],
      ['Errors', 'Invalid login, missing fields, AI misconfiguration'],
    ],
    {
      x: 0.55, y: 1.2, w: 12.2, h: 5.4,
      colW: [2.8, 9.4],
      border: [{ pt: 0.5, color: BLUE_LIGHT }],
      fontFace: 'Calibri',
      fontSize: 15,
      color: INK,
      align: 'left',
      valign: 'middle',
    }
  );
  addFooter(s, 11);
}

// ─── Slide 12: Where testing was done ───────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Where Testing Was Done');
  const places = [
    { t: 'Browser (Chrome)', d: 'Full student & admin UI flows, responsive layout, AI chat panel' },
    { t: 'Cursor / VS Code terminal', d: 'npm run dev / build, server logs, health curl checks' },
    { t: 'HTTP API checks', d: 'GET /api/health, auth, courses, AI chat with JWT' },
    { t: 'SQLite database file', d: 'Verify seed data, progress rows, lesson content' },
    { t: 'GitHub repository', d: 'Version control, .env exclusion, code review of routes' },
    { t: 'Production mode', d: 'npm run start:fast — cached frontend + API on one port' },
  ];
  places.forEach((p, i) => {
    const y = 1.15 + i * 0.85;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.55, y, w: 12.2, h: 0.75,
      fill: { color: i % 2 ? SLATE : BLUE_LIGHT },
      rectRadius: 0.08,
    });
    s.addText(p.t, {
      x: 0.75, y: y + 0.08, w: 3.8, h: 0.55,
      fontSize: 16, bold: true, color: BLUE_DARK, fontFace: 'Calibri', valign: 'middle',
    });
    s.addText(p.d, {
      x: 4.6, y: y + 0.08, w: 7.9, h: 0.55,
      fontSize: 15, color: INK, fontFace: 'Calibri', valign: 'middle',
    });
  });
  addFooter(s, 12);
}

// ─── Slide 13: Security ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Security');
  bulletBlock(s, [
    'GEMINI_API_KEY stored only in server/.env — never committed to Git.',
    '.gitignore blocks .env / server/.env; only .env.example is public.',
    'React frontend never receives or stores the Gemini API key.',
    'Passwords hashed with bcrypt; JWT signs identity & role.',
    'Role guards: STUDENT vs ADMIN routes on backend.',
    'Request validation (e.g. Zod) prevents invalid AI chat payloads.',
    'Error responses avoid exposing secrets or stack traces to clients.',
  ], { fontSize: 17 });
  addFooter(s, 13);
}

// ─── Slide 14: Workflow ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Application Workflow');
  const flow = ['Login', 'Choose Subject', 'Read Lesson', 'Take Exercise', 'Ask AI Tutor', 'Gemini Answer', 'Track Progress'];
  flow.forEach((label, i) => {
    const x = 0.4 + i * 1.85;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.0, w: 1.7, h: 1.3,
      fill: { color: i === 4 || i === 5 ? BLUE_DARK : BLUE },
      rectRadius: 0.1,
    });
    s.addText(label, {
      x, y: 3.0, w: 1.7, h: 1.3,
      fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Calibri',
    });
    if (i < flow.length - 1) {
      s.addText('→', {
        x: x + 1.55, y: 3.4, w: 0.4, h: 0.5,
        fontSize: 20, color: MUTED, align: 'center',
      });
    }
  });
  s.addText('Learning cycle: Learn → Practice → Ask AI → Improve → Track → Complete', {
    x: 0.55, y: 5.0, w: 12.2, h: 0.5,
    fontSize: 18, color: BLUE_DARK, fontFace: 'Calibri', align: 'center',
  });
  addFooter(s, 14);
}

// ─── Slide 15: Results ──────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Results');
  bulletBlock(s, [
    'Working interactive learning environment for 5 school subjects.',
    'AI-powered student assistance via secure Gemini integration.',
    'JWT auth with Student and Admin experiences.',
    'Faster loads through memory cache, PWA, gzip, and lazy routes.',
    'Structured Express API + SQLite data model.',
    'Testing performed across auth, API, AI, UI, and error paths.',
    'Repository published on GitHub with secrets kept out of source control.',
  ], { fontSize: 17 });
  addFooter(s, 15);
}

// ─── Slide 16: Future ───────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WHITE } });
  sectionBar(s, 'Future Improvements');
  bulletBlock(s, [
    'Somali voice-based tutor (speech in / speech out).',
    'More Somali educational content and localized examples.',
    'Personalized learning recommendations from progress data.',
    'Richer student performance analytics for teachers/admins.',
    'Mobile application (or installable PWA enhancements).',
    'Offline learning support for low-connectivity areas.',
    'Optional Redis/cloud DB if deployment scale requires it.',
  ], { fontSize: 17 });
  addFooter(s, 16);
}

// ─── Slide 17: Conclusion ───────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color: BLUE_DARK },
  });
  s.addText('Conclusion', {
    x: 0.7, y: 1.8, w: 12, h: 0.6,
    fontSize: 28, bold: true, color: BLUE_LIGHT, fontFace: 'Calibri',
  });
  s.addText(
    'Somali-AI-Tutor combines interactive learning, AI assistance, and modern web technologies to provide Somali students with a more accessible and engaging learning experience.',
    {
      x: 0.7, y: 2.7, w: 12, h: 2.2,
      fontSize: 24, color: WHITE, fontFace: 'Calibri',
    }
  );
  s.addText('Thank you  ·  Questions?', {
    x: 0.7, y: 5.5, w: 12, h: 0.6,
    fontSize: 22, bold: true, color: BLUE_LIGHT, fontFace: 'Calibri',
  });
  s.addText('17/17', {
    x: 0.7, y: 6.8, w: 12, h: 0.35,
    fontSize: 12, color: '93C5FD', fontFace: 'Calibri',
  });
}

await pptx.writeFile({ fileName: outFile });
console.log('Wrote', outFile);
