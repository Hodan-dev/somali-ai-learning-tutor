# Somali AI Learning Tutor

A Somali-friendly educational web platform where students learn **Physics**, **Biology**, **English**, **Chemistry**, and **Mathematics** through structured lessons, practice exercises, an AI tutor, and progress tracking.

**Learning cycle:** Learn → Practice → Ask AI → Improve → Track → Complete

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt (roles: `ADMIN`, `STUDENT`)
- **AI:** Google AI Studio (Gemini) via `@google/genai`, with a built-in Somali tutor fallback

## Quick start

```bash
# From repo root
npm install
npm install --prefix server
npm install --prefix client

npm run dev
```

- App: [http://127.0.0.1:3850](http://127.0.0.1:3850)
- API: [http://127.0.0.1:3847](http://127.0.0.1:3847)

### Faster loading (cached production mode)

For the fastest startup and repeat visits, build once and serve everything from one port with browser + server caching:

```bash
npm run start:fast
```

Then open **http://127.0.0.1:3847** (API + cached frontend on the same port).

What this enables:
- **PWA service worker** caches JS/CSS/fonts in the browser
- **Gzip compression** on API responses
- **Memory cache** on course list API (`X-Cache: HIT` header)
- **Lazy-loaded pages** so the first screen loads smaller bundles

## Demo accounts

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Student | `ahmed@student.so`      | `password123`|
| Admin   | `admin@somalilearn.so`  | `password123`|

## Subjects (seed data)

- Physics Basics
- Biology Basics
- English Basics
- Chemistry Basics
- Mathematics Basics

Each course includes modules, lessons (with Somali explanations), and exercises.

## Features

### Student
- Register / login
- Dashboard with Continue Learning
- Browse courses & curriculum
- W3Schools-inspired lesson layout (curriculum · content · AI panel)
- Mark lessons complete
- Exercises with instant feedback, hints, retry
- AI Tutor (lesson context + hints-first behavior)
- Progress & profile

### Admin
- Dashboard stats
- Create courses & modules
- Upload PDF lessons (embedded viewer)
- Create text lessons & exercises
- View students and per-student progress

## AI Tutor (Google AI Studio + `@google/genai`)

1. Open [Google AI Studio](https://aistudio.google.com/apikey) and create an API key.
2. Copy `server/.env.example` to `server/.env` and set:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.6-flash
```

3. Restart the server (`npm run dev`).

The backend uses the official `@google/genai` SDK. The API key stays in `server/.env` only — never in the React frontend.  
Students call `POST /api/ai/chat`; the backend forwards the question to Gemini with lesson context.

Without a key, a local Somali tutor fallback still answers using lesson content.

## Environment

`server/.env`:

```env
PORT=3847
JWT_SECRET=change-me
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
UPLOAD_DIR=uploads
MONGODB_URI=mongodb://127.0.0.1:27017/somali-tutor
```

If `MONGODB_URI` is not set, the server uses an **in-memory MongoDB** for local development (data resets on restart). For production, point `MONGODB_URI` at your MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas).

## Project layout

```text
client/   React app (port 3850, proxies /api)
server/   Express API + MongoDB + uploads
```
