# Somali-AI-Tutor Presentation Pack

## Files

| File | Purpose |
|------|---------|
| `Somali-AI-Tutor-Presentation.pptx` | Ready-to-present PowerPoint (17 slides) |
| `generate.mjs` | Regenerates the `.pptx` if you change content |
| `SPEAKER_NOTES.md` | Talking points for each slide |

## Regenerate

```bash
# from repo root (pptxgenjs must be available)
npm install pptxgenjs --no-save
node docs/presentation/generate.mjs
```

## Before you present

1. Open the `.pptx` and replace **Student / Presenter Name** and **University / Program** on slide 1.
2. Emphasize these 5 technical areas:
   - Technologies used
   - Problem & solution
   - Application health (`GET /api/health`)
   - Session (JWT) & caching (memory + PWA)
   - Testing (where and how)

## Accurate stack (what we built)

This deck matches the **implemented** project:

- Frontend: React, Vite, TypeScript, Tailwind
- Backend: Node.js, Express
- Database: **SQLite** (not MongoDB)
- AI: Google Gemini via `@google/genai`
- Caching: **in-memory API cache + PWA + gzip** (not Redis)
- Auth: JWT + bcrypt

If your course handout required MongoDB/Redis wording, keep slide 6’s note and use slide 16 (Future) to say Redis/cloud DB can be added for scale.
