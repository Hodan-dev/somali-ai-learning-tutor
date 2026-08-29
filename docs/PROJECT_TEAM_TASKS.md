# Somali AI Learning Tutor — Team Project Task Document

**Project title:** Somali AI Learning Tutor Platform  
**Subjects:** Physics · Biology · English · Chemistry · Mathematics  
**Team size:** 6 members  
**Document purpose:** Task division, responsibilities, deliverables, and presentation guide for group work

---

## 1. Project Summary

### 1.1 Problem
Somali students often lack organized online learning materials in their language. Existing resources are scattered, not structured, and do not combine lessons, exercises, AI help, and progress tracking in one place.

### 1.2 Solution
**Somali AI Learning Tutor** is a web platform where:
- **Students** learn school subjects, complete exercises, ask an AI tutor, and track progress
- **Admins** upload and manage courses, lessons (including PDF), and exercises

### 1.3 Learning cycle
```text
LEARN → PRACTICE → ASK AI → IMPROVE → TRACK → COMPLETE
```

### 1.4 Technology stack
| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite |
| Authentication | JWT + bcrypt (ADMIN / STUDENT roles) |
| AI Tutor | Google Gemini via `@google/genai` (API key on server only) |

---

## 2. Team Roles (6 Members)

| # | Role | Main focus |
|---|------|------------|
| 1 | **Team Lead / Project Manager** | Planning, coordination, documentation, final report |
| 2 | **Frontend Developer (Student UI)** | Student pages, dashboard, courses, lessons |
| 3 | **Frontend Developer (Auth & Landing)** | Landing page, login, register, responsive design |
| 4 | **Backend Developer (API & Database)** | Express API, SQLite schema, auth, security |
| 5 | **AI & Content Developer** | Gemini integration, lesson context, PDF upload |
| 6 | **QA, Admin UI & Testing** | Admin dashboard, testing, demo script, presentation |

---

## 3. Task Breakdown by Team Member

### Member 1 — Team Lead / Project Manager

**Responsibilities**
- Organize meetings and deadlines
- Track task completion for all 6 members
- Write project introduction, conclusion, and final report
- Prepare presentation slides
- Manage Git repository (branches, commits, README)

**Tasks**
| Task | Deliverable | Status |
|------|-------------|--------|
| Write project proposal & objectives | 1–2 page document | ☐ |
| Create Gantt chart / timeline | Schedule document | ☐ |
| Maintain `README.md` | Setup instructions | ☐ |
| Coordinate integration between frontend & backend | Working demo | ☐ |
| Prepare final presentation (10–15 min) | PowerPoint / PDF | ☐ |
| Write conclusion & future work section | Report pages | ☐ |

**Files to know**
- `README.md`
- `docs/PROJECT_TEAM_TASKS.md` (this document)

---

### Member 2 — Frontend Developer (Student UI)

**Responsibilities**
- Build student dashboard, courses, lessons, exercises, progress pages
- W3Schools-style lesson layout (sidebar · content · AI panel)
- Somali-friendly labels (Baro, Koorso, Cashar, Layli, Horumar)

**Tasks**
| Task | Deliverable | Status |
|------|-------------|--------|
| Student dashboard with “Continue Learning” | `StudentDashboard.tsx` | ☐ |
| Courses listing page (5 subjects) | `CoursesPage.tsx` | ☐ |
| Course detail with modules & lessons | `CourseDetailPage.tsx` | ☐ |
| Lesson page (3-column layout) | `LessonPage.tsx` | ☐ |
| Exercise page with feedback | `ExercisePage.tsx` | ☐ |
| Progress & profile pages | `StudentMore.tsx` | ☐ |
| Mobile responsive layout | Works on phone/tablet | ☐ |

**Files to edit**
- `client/src/pages/StudentDashboard.tsx`
- `client/src/pages/CoursesPage.tsx`
- `client/src/pages/CourseDetailPage.tsx`
- `client/src/pages/LessonPage.tsx`
- `client/src/pages/ExercisePage.tsx`
- `client/src/pages/StudentMore.tsx`
- `client/src/components/AppShell.tsx`

---

### Member 3 — Frontend Developer (Auth & Landing)

**Responsibilities**
- Professional landing page
- Login, register, logout flows
- Navigation and UI components
- Connect frontend to backend API (no API keys in browser)

**Tasks**
| Task | Deliverable | Status |
|------|-------------|--------|
| Landing page (hero, features, CTA) | `LandingPage.tsx` | ☐ |
| Login page (student + admin) | `AuthPages.tsx` | ☐ |
| Register page (student only) | `AuthPages.tsx` | ☐ |
| Protected routes (student vs admin) | `App.tsx` | ☐ |
| API helper with JWT token | `client/src/lib/api.ts` | ☐ |
| Auth context (login state) | `client/src/auth.tsx` | ☐ |
| Shared UI (buttons, progress bars) | `client/src/components/ui.tsx` | ☐ |

**Files to edit**
- `client/src/pages/LandingPage.tsx`
- `client/src/pages/AuthPages.tsx`
- `client/src/App.tsx`
- `client/src/lib/api.ts`
- `client/src/auth.tsx`
- `client/src/components/ui.tsx`

---

### Member 4 — Backend Developer (API & Database)

**Responsibilities**
- REST API design and implementation
- Database schema and seed data
- Authentication and role-based access
- Security (password hashing, JWT, protected routes)

**Tasks**
| Task | Deliverable | Status |
|------|-------------|--------|
| Database schema (users, courses, lessons, exercises, progress) | `server/src/db.ts` | ☐ |
| Seed demo data (5 subjects) | `server/src/seed.ts` | ☐ |
| Auth APIs (register, login, logout) | `server/src/routes/auth.ts` | ☐ |
| Courses CRUD APIs | `server/src/routes/courses.ts` | ☐ |
| Lessons APIs + PDF upload endpoint | `server/src/routes/lessons.ts` | ☐ |
| Exercises submit & scoring APIs | `server/src/routes/exercises.ts` | ☐ |
| Progress tracking APIs | `server/src/routes/progress.ts` | ☐ |
| JWT middleware & role checks | `server/src/middleware/auth.ts` | ☐ |
| Health check endpoint | `GET /api/health` | ☐ |

**Files to edit**
- `server/src/db.ts`
- `server/src/seed.ts`
- `server/src/index.ts`
- `server/src/routes/*.ts`
- `server/src/middleware/auth.ts`

---

### Member 5 — AI & Content Developer

**Responsibilities**
- Google Gemini (Google AI Studio) integration
- AI tutor behavior (Somali, hints, lesson-aware)
- PDF lesson upload and text extraction
- Educational content for 5 subjects

**Tasks**
| Task | Deliverable | Status |
|------|-------------|--------|
| Gemini service with `@google/genai` | `server/src/services/gemini.ts` | ☐ |
| AI chat endpoint | `POST /api/ai/chat` | ☐ |
| Lesson context retrieval for AI | `server/src/services/ai.ts` | ☐ |
| Configure `GEMINI_API_KEY` in `server/.env` | Working AI (never in frontend) | ☐ |
| PDF upload → text extraction → store | Admin lessons upload | ☐ |
| Write sample lessons (Physics, Bio, etc.) | Seed content | ☐ |
| AI tutor rules (hints first, Somali language) | System prompt in `ai.ts` | ☐ |
| Test AI with sample questions | Test log / screenshots | ☐ |

**Files to edit**
- `server/src/services/gemini.ts`
- `server/src/services/ai.ts`
- `server/src/routes/ai.ts`
- `server/src/routes/lessons.ts`
- `server/.env` (local only — not committed)

**Sample AI test questions**
- `Maxay tahay force ee Physics?`
- `Ii sharax chemical reaction`
- `Xalli: x + 5 = 12`
- `What is a cell?`
- `I sii hint`

---

### Member 6 — QA, Admin UI & Testing

**Responsibilities**
- Admin dashboard and content management
- Student progress monitoring
- Full system testing and bug reports
- Demo preparation for presentation

**Tasks**
| Task | Deliverable | Status |
|------|-------------|--------|
| Admin dashboard (stats) | `AdminPages.tsx` | ☐ |
| Admin: manage courses & modules | Admin courses page | ☐ |
| Admin: upload lessons (PDF + text) | Admin lessons page | ☐ |
| Admin: create exercises | Admin exercises page | ☐ |
| Admin: view students & progress | Admin students page | ☐ |
| Test student full flow (login → lesson → exercise → AI) | Test report | ☐ |
| Test admin full flow (upload → publish → monitor) | Test report | ☐ |
| Prepare demo script for presentation | Demo checklist | ☐ |
| Verify health check works | `curl /api/health` | ☐ |

**Files to edit**
- `client/src/pages/AdminPages.tsx`

---

## 4. Project Phases & Timeline

### Phase 1 — Planning (Week 1)
| Task | Owner |
|------|-------|
| Define requirements & user roles | Member 1 |
| Choose tech stack | All |
| Draw system architecture diagram | Member 4 |
| Design database ERD | Member 4 |
| UI wireframes (landing, dashboard, lesson) | Members 2 & 3 |

### Phase 2 — Core Development (Week 2–3)
| Task | Owner |
|------|-------|
| Backend API + database + auth | Member 4 |
| Landing + login + register | Member 3 |
| Student dashboard + courses | Member 2 |
| Seed content for 5 subjects | Member 5 |
| Admin dashboard basics | Member 6 |

### Phase 3 — Advanced Features (Week 4)
| Task | Owner |
|------|-------|
| Lesson page + AI panel | Member 2 |
| Gemini AI integration | Member 5 |
| PDF upload + extraction | Member 5 |
| Exercises + feedback system | Member 2 & 4 |
| Progress tracking | Member 4 |

### Phase 4 — Testing & Polish (Week 5)
| Task | Owner |
|------|-------|
| Full QA testing | Member 6 |
| Bug fixes | All |
| Responsive mobile testing | Member 3 |
| Caching / performance | Member 4 |
| Documentation | Member 1 |

### Phase 5 — Presentation (Week 6)
| Task | Owner |
|------|-------|
| Final demo rehearsal | All |
| Presentation slides | Member 1 |
| Live demo (student + admin) | Members 2, 5, 6 |
| Q&A preparation | All |

---

## 5. Deliverables Checklist (For Submission)

### 5.1 Software deliverables
- [ ] Working web application (frontend + backend)
- [ ] Student role (register, learn, exercise, AI, progress)
- [ ] Admin role (courses, lessons, exercises, students)
- [ ] 5 subjects with sample lessons and exercises
- [ ] AI tutor connected to Gemini (backend only)
- [ ] PDF lesson upload (admin)
- [ ] Progress tracking

### 5.2 Documentation deliverables
- [ ] Project report (introduction, design, implementation, testing, conclusion)
- [ ] README with setup instructions
- [ ] System architecture diagram
- [ ] Database ERD diagram
- [ ] API endpoint list
- [ ] User manual (student + admin)
- [ ] Team task document (this file)
- [ ] Screenshots of main pages

### 5.3 Presentation deliverables
- [ ] 10–15 minute live demo
- [ ] Slides (problem, solution, features, tech stack, demo, future work)
- [ ] Each member explains their part (1–2 minutes each)

---

## 6. Demo Script (For Presentation)

### Part A — Student demo (5 minutes) — Member 2 or 6
1. Open landing page → click **Start Learning**
2. Login: `ahmed@student.so` / `password123`
3. Show dashboard → **Continue Learning**
4. Open **Physics Basics** → open a lesson
5. Read lesson content (formulas, Somali explanation)
6. Open **Practice Exercise** → answer correctly → show `✓ Sax! +10 points`
7. Answer incorrectly → show hint
8. Open **Macallinka AI** → ask: `Ii sharax chemical reaction`
9. Mark lesson complete → show progress update

### Part B — Admin demo (3 minutes) — Member 5 or 6
1. Logout → login: `admin@somalilearn.so` / `password123`
2. Show admin dashboard (students, courses, lessons, exercises counts)
3. Go to **Casharrada** → upload a PDF lesson OR add text lesson
4. Show lesson appears in course for students

### Part C — Technical proof (2 minutes) — Member 4 or 5
1. Open `http://127.0.0.1:3847/api/health`
2. Show `"configured": true` for Gemini
3. Explain: API key is in `server/.env`, not in React
4. Show file: `server/src/services/gemini.ts`

---

## 7. API Endpoints (Reference for Report)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Student registration | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Auth |
| GET | `/api/health` | Server + AI status | Public |
| GET | `/api/courses` | List courses | Student/Admin |
| GET | `/api/courses/:id` | Course detail + curriculum | Student/Admin |
| GET | `/api/lessons/:id` | Lesson content | Student/Admin |
| POST | `/api/lessons/:id/complete` | Mark lesson done | Student |
| POST | `/api/lessons/upload` | Upload PDF lesson | Admin |
| GET | `/api/exercises/:id` | Get exercise | Student |
| POST | `/api/exercises/:id/submit` | Submit answer | Student |
| POST | `/api/ai/chat` | AI tutor chat | Student |
| GET | `/api/progress` | Student progress | Student |
| GET | `/api/admin/stats` | Admin dashboard | Admin |
| GET | `/api/admin/students` | List students | Admin |

---

## 8. Database Tables (Reference for Report)

| Table | Purpose |
|-------|---------|
| `users` | Students and admins |
| `courses` | Physics, Biology, English, Chemistry, Mathematics |
| `modules` | Course sections |
| `lessons` | Lesson content + optional PDF |
| `lesson_chunks` | Text chunks for AI context |
| `exercises` | Practice sets per lesson |
| `questions` | MCQ, true/false, short answer |
| `lesson_progress` | Student lesson completion |
| `exercise_attempts` | Scores and attempts |
| `chat_sessions` / `chat_messages` | AI tutor history |
| `course_completions` | Finished courses |

---

## 9. How to Run the Project (For All Members)

```bash
# Install once
npm install
npm install --prefix server
npm install --prefix client

# Development (2 terminals combined)
npm run dev

# OR fastest cached mode (1 port)
npm run start:fast
```

**URLs**
- Dev frontend: http://127.0.0.1:3850
- API / health: http://127.0.0.1:3847/api/health
- Fast mode (all-in-one): http://127.0.0.1:3847

**Demo accounts**
- Student: `ahmed@student.so` / `password123`
- Admin: `admin@somalilearn.so` / `password123`

---

## 10. Report Structure (Suggested for Final Document)

Each member can write one section:

| Section | Suggested owner | Pages |
|---------|-----------------|-------|
| 1. Introduction & problem statement | Member 1 | 1–2 |
| 2. Objectives & scope | Member 1 | 1 |
| 3. Literature review / related work | Member 1 | 1–2 |
| 4. System design & architecture | Member 4 | 2–3 |
| 5. Database design (ERD) | Member 4 | 1–2 |
| 6. Frontend implementation | Members 2 & 3 | 3–4 |
| 7. Backend & API implementation | Member 4 | 2–3 |
| 8. AI tutor & Gemini integration | Member 5 | 2–3 |
| 9. Testing & results | Member 6 | 2 |
| 10. Conclusion & future work | Member 1 | 1 |
| 11. References & appendices | All | 1–2 |

---

## 11. Future Improvements (For Conclusion Section)

- Video lessons
- Somali voice tutor (text-to-speech)
- Certificates after course completion
- Leaderboards and badges
- Teacher role (separate from admin)
- Mobile app version
- More subjects and PDF content from teachers

---

## 12. Weekly Meeting Template

**Date:** _______________  
**Attendees:** Member 1–6  

| Member | Completed this week | Next week plan | Blockers |
|--------|---------------------|----------------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |

**Decisions made:**
1. 
2. 

**Git commits this week:**
- 

---

## 13. Individual Contribution Statement (Template)

Each member fills this for the final report:

> **Name:** ______________________  
> **Role:** ______________________  
> **Tasks completed:**  
> -  
> -  
> **Files mainly worked on:**  
> -  
> **Challenges faced:**  
> -  
> **What I learned:**  
> -  

---

## 14. Quick Reference — Where Things Are Connected

```text
Student browser (React)
        │
        ▼
POST /api/ai/chat  ──────────►  server/src/routes/ai.ts
        │                              │
        ▼                              ▼
server/src/services/ai.ts  ──►  server/src/services/gemini.ts
        │                              │
        │                              ▼
        │                    Google Gemini API
        │                    (GEMINI_API_KEY in server/.env)
        ▼
lesson_chunks from database (PDF/text content)
```

---

**Document version:** 1.0  
**Project:** Somali AI Learning Tutor  
**Prepared for:** 6-person team task assignment and academic submission
