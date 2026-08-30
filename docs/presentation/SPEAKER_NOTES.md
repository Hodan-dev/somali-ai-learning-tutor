# Speaker Notes — Somali-AI-Tutor

## Slide 1 — Title
Introduce yourself, the project name, and the learning cycle motto.

## Slide 2 — Problem
Focus on **access**, **no immediate help**, **hard STEM/English concepts**, and **missing Somali-friendly AI**.

## Slide 3 — Solution
Say it is one web app: lessons + exercises + AI tutor + progress + admin.

## Slide 4 — Features
Walk the six cards quickly; spend most time on AI Tutor and Progress.

## Slide 5 — Technologies
Name each stack layer. Correct anyone who assumes MongoDB/Redis — we used SQLite and memory/PWA cache.

## Slide 6 — Architecture
Top-down: User → React → Express → SQLite / Cache / Gemini. Stress: **Gemini key never leaves the server**.

## Slide 7 — AI Tutor
Narrate the 7 steps as a story of one student question.

## Slide 8 — Health
Demo live if possible: `curl http://127.0.0.1:3847/api/health` → show `ok` and `ai.configured`.

## Slide 9 — SRS
Functional vs non-functional; roles STUDENT / ADMIN.

## Slide 10 — Session & caching
JWT = session identity. Cache = speed (courses API + browser assets). SQLite = permanent storage.

## Slide 11–12 — Testing
Say what + where. Mention browser UI, terminal health checks, API auth/AI, SQLite seed verification.

## Slide 13 — Security
`.env` gitignored; bcrypt passwords; role guards; no secrets in error messages.

## Slide 14 — Workflow
Point along the arrows; end with the learning cycle.

## Slide 15 — Results
What works today: 5 subjects, AI help, secure API, caching, tested flows, GitHub repo.

## Slide 16 — Future
Voice, more Somali content, analytics, mobile, offline; Redis/cloud if scale needs it.

## Slide 17 — Conclusion
Read the quote slowly; invite questions.

## Demo accounts (if showing live)

| Role | Email | Password |
|------|-------|----------|
| Student | ahmed@student.so | password123 |
| Admin | admin@somalilearn.so | password123 |
