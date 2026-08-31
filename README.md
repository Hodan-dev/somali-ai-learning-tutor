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

### Windows (Hodan laptop — Desktop)

Project folder on your Desktop:

```text
C:\Users\HODAN\Desktop\somali-ai-learning-tutor
```

**First time** — open **PowerShell** and run:

```powershell
powershell -ExecutionPolicy Bypass -Command "git clone https://github.com/Hodan-dev/somali-ai-learning-tutor.git C:\Users\HODAN\Desktop\somali-ai-learning-tutor; cd C:\Users\HODAN\Desktop\somali-ai-learning-tutor; powershell -ExecutionPolicy Bypass -File scripts\setup-desktop-windows.ps1"
```

Or step by step:

```powershell
git clone https://github.com/Hodan-dev/somali-ai-learning-tutor.git C:\Users\HODAN\Desktop\somali-ai-learning-tutor
cd C:\Users\HODAN\Desktop\somali-ai-learning-tutor
powershell -ExecutionPolicy Bypass -File scripts\setup-desktop-windows.ps1
```

**Alternative path** (`Projects` folder): use `scripts\setup-hodan-windows.ps1` instead.

Then edit `server\.env` (MongoDB Atlas URI + Gemini key) and run:

```powershell
npm run dev
```

Open **http://127.0.0.1:3850**

### All platforms

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

## MongoDB + Compass (fix “Failed to connect to localhost:27017”)

Compass connects to **your computer’s** MongoDB — not the cloud dev server. If you see that error, MongoDB is not running on your PC yet.

### Option A — Docker (easiest)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
npm run db          # start MongoDB on localhost:27017
npm run dev         # start the app (seeds data on first run)
```

In **MongoDB Compass**, connect with:

```text
mongodb://localhost:27017/somali-tutor
```

Stop MongoDB when done: `npm run db:stop`

### Option B — Install MongoDB on Windows

1. Download **MongoDB Community Server**: https://www.mongodb.com/try/download/community  
2. Run the installer → choose **Complete** → check **Install MongoDB as a Service**  
3. Open **Services** (`Win + R` → `services.msc`) → find **MongoDB Server** → **Start**  
4. Open Compass → connection string:

```text
mongodb://localhost:27017/somali-tutor
```

5. In `server/.env` set:

```env
MONGODB_URI=mongodb://localhost:27017/somali-tutor
```

6. Run `npm run dev` — demo courses and users are created automatically.

### Compass tips

- Use exactly: `mongodb://localhost:27017/somali-tutor` (database name `somali-tutor`)  
- Delete duplicate `localhost:27017` saved connections in Compass if you have many  
- After the app runs once, refresh Compass to see collections (`users`, `courses`, `lessons`, …)

## Project layout

```text
client/   React app (port 3850, proxies /api)
server/   Express API + MongoDB + uploads
```

## Deploy to Vercel (frontend) + Render (API)

This app has two parts: **React frontend** (Vercel) and **Express API + MongoDB** (not on Vercel alone).

### Step 1 — MongoDB Atlas (database)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Database Access → create user + password
3. Network Access → allow `0.0.0.0/0` (or Render IPs)
4. Copy connection string, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/somali-tutor`

### Step 2 — Deploy API on Render

1. Push this repo to GitHub
2. Go to [Render](https://render.com) → **New** → **Blueprint** → connect repo  
   (uses `render.yaml` in the repo root)
3. Set environment variables in Render:
   - `MONGODB_URI` — your Atlas connection string
   - `GEMINI_API_KEY` — optional, for AI tutor
4. Deploy → copy your API URL, e.g. `https://ardeytechhub-api.onrender.com`
5. Test: open `https://YOUR-API.onrender.com/api/health` — should return `{"ok":true,...}`

### Step 3 — Deploy frontend on Vercel

1. Go to [Vercel](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Vercel reads `vercel.json` automatically:
   - **Build command:** `npm run build --prefix client`
   - **Output directory:** `client/dist`
3. **Environment variables** (Vercel → Project → Settings → Environment Variables):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com` (no trailing slash) |

4. Click **Deploy**
5. Open your Vercel URL (e.g. `https://ardeytechhub.vercel.app`)

### Step 4 — Log in

Use demo accounts after the API seeds the database on first request:

- Student: `ahmed@student.so` / `password123`
- Admin: `admin@somalilearn.so` / `password123`

### Notes

- **PDF uploads** on Render use ephemeral disk — re-import Manhajka PDFs after redeploy, or use MongoDB + cloud storage later.
- **Custom domain:** add in Vercel → Domains; keep `VITE_API_URL` pointing to Render.
- **Local dev** — leave `VITE_API_URL` empty; Vite proxy sends `/api` to port 3847.

### Vercel site blank or won't load?

In Vercel → **Project → Settings → General → Root Directory**, use **one** of these (not both):

| Root Directory | What Vercel uses |
|----------------|------------------|
| **Empty** (repo root) | Root `vercel.json` builds `client/` automatically |
| **`client`** | `client/vercel.json` + Vite auto-detect |

Then **Redeploy** (Deployments → ⋯ → Redeploy).

Also check:
- Build log shows **Build Completed** (not failed)
- Environment variable `VITE_API_URL` = your Render API URL (login needs API; home page should still load without it)
- Open the exact URL from **Deployments → Visit** (not an old preview link)

