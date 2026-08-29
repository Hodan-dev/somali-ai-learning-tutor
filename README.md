# Somali AI Learning Tutor

A Somali-friendly educational web platform where students learn **Physics**, **Biology**, **English**, **Chemistry**, and **Mathematics** through structured lessons, practice exercises, an AI tutor, and progress tracking.

**Learning cycle:** Learn → Practice → Ask AI → Improve → Track → Complete

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (Better SQLite3)
- **Auth:** JWT + bcrypt (roles: `ADMIN`, `STUDENT`)
- **AI:** Google AI Studio (Gemini), with a built-in Somali tutor fallback

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
- Upload PDF lessons (text extraction for AI context)
- Create text lessons & exercises
- View students and per-student progress

## AI Tutor (Google AI Studio)

1. Open [Google AI Studio](https://aistudio.google.com/apikey) and create an API key.
2. Put it in `server/.env`:

```env
GOOGLE_AI_API_KEY=your_key_here
GOOGLE_AI_MODEL=gemini-2.0-flash
```

3. Restart the server (`npm run dev`).

The backend calls Gemini at `generativelanguage.googleapis.com` — the key never goes to the browser.  
Without a key, a local Somali tutor fallback still answers using lesson content.

## Environment

`server/.env`:

```env
PORT=3847
JWT_SECRET=change-me
GOOGLE_AI_API_KEY=
GOOGLE_AI_MODEL=gemini-2.0-flash
UPLOAD_DIR=uploads
DB_PATH=data/tutor.db
```

## Project layout

```text
client/   React app (port 3850, proxies /api)
server/   Express API + SQLite + uploads
```
