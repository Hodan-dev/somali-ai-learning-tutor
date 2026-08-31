import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChartColumnIncreasing,
  CheckCircle2,
  GraduationCap,
  Languages,
  Menu,
  Quote,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#how-it-works', label: 'How to Use' },
  { href: '#testimonials', label: 'Testimonials' },
] as const;

const STEPS = [
  {
    step: '1',
    title: 'Register as a student',
    body: 'Create your free account with your name and email. It takes less than one minute.',
  },
  {
    step: '2',
    title: 'Choose a subject',
    body: 'Pick Physics, Biology, English, Chemistry, or Mathematics and open the course.',
  },
  {
    step: '3',
    title: 'Learn & practice',
    body: 'Read lessons, watch PDF materials, and complete exercises with instant feedback.',
  },
  {
    step: '4',
    title: 'Ask the AI tutor',
    body: 'Stuck on a concept? Ask questions in Somali and get clear, step-by-step help.',
  },
  {
    step: '5',
    title: 'Track your progress',
    body: 'See completed lessons, exercise scores, and how much you have improved over time.',
  },
] as const;

const TESTIMONIALS = [
  {
    name: 'Fatima Hassan',
    subject: 'Physics student',
    quote:
      'Physics used to feel impossible. The AI tutor explains in simple Somali, and the practice exercises helped me pass my exams.',
    rating: 5,
  },
  {
    name: 'Mohamed Ali',
    subject: 'Mathematics student',
    quote:
      'I love that I can learn at my own pace. The step-by-step lessons and progress bar keep me motivated every day.',
    rating: 5,
  },
  {
    name: 'Aisha Omar',
    subject: 'Biology student',
    quote:
      'The platform is easy to use even on my phone. Lessons are clear, and asking the AI tutor feels like having a real teacher.',
    rating: 5,
  },
  {
    name: 'Ibrahim Yusuf',
    subject: 'English student',
    quote:
      'English grammar finally makes sense. I practice exercises after each lesson and can see my scores improving week by week.',
    rating: 5,
  },
] as const;

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-blue-50 hover:text-sea"
    >
      {label}
    </a>
  );
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <BrandLogo size="lg" subtitle="Baro · Learning Platform" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink transition hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white transition hover:bg-sea-dark"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-ink hover:bg-blue-50 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-blue-100 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} onClick={closeMobile} />
              ))}
              <hr className="my-2 border-blue-100" />
              <Link
                to="/login"
                onClick={closeMobile}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-blue-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="rounded-lg bg-sea px-3 py-2 text-center text-sm font-semibold text-white hover:bg-sea-dark"
              >
                Register as Student
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section id="home" className="scroll-mt-20">
        <div className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-white">
          <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20">
            <div className="relative z-10">
              <p className="mb-4 inline-flex rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-sky-700 shadow-sm backdrop-blur">
                Somali AI Learning Tutor
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-[3.4rem]">
                Waxbarta aan barwaaqo gaarnee
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-sky-50 sm:text-lg">
                Baro Physics, Biology, English, Chemistry, iyo Mathematics — casharro cad, layliyo,
                macallin AI, iyo raadinta horumarkaaga hal meel.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">
                A learning platform built for Somali students — study lessons, practice exercises,
                ask the AI tutor anytime, and track your progress.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-md transition hover:bg-sky-50"
                >
                  Register Free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
                >
                  How it works
                </a>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-xl px-4 py-3 text-sm font-medium text-white hover:underline"
                >
                  Login
                </Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/95">
                {['Physics', 'Biology', 'English', 'Chemistry', 'Mathematics'].map((subject) => (
                  <li key={subject} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    {subject}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border-4 border-white bg-white p-2 shadow-[0_25px_60px_-20px_rgba(14,165,233,0.45)]">
                <img
                  src="/hero-students.jpg"
                  alt="Somali students learning together"
                  className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:block">
                <p className="text-xs font-medium text-sky-600">Barasho · Horumar · Barwaaqo</p>
                <p className="font-display text-sm font-bold text-ink">Learn · Grow · Prosper</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-y border-blue-100/70 bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-sea">About</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
              Our goal is simple: make learning easy for every Somali student
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Somali AI Learning Tutor helps students understand school subjects without confusion. We
              combine structured lessons, practice exercises, and an AI tutor that speaks in clear Somali
              so you can learn at your own speed — at home, at school, or anywhere.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: 'Clear lessons',
                body: 'Step-by-step content in Physics, Biology, English, Chemistry, and Mathematics.',
              },
              {
                title: 'Real practice',
                body: 'Exercises after each lesson so you remember what you learned, not just read it.',
              },
              {
                title: 'Always available',
                body: 'The AI tutor and your progress dashboard are ready whenever you want to study.',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm"
              >
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-sea">
              How to use
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">Five easy steps to get started</h2>
            <p className="mt-3 text-muted">
              No complicated setup. Register, pick a subject, and start learning in minutes.
            </p>
          </div>

          <ol className="mt-12 space-y-4">
            {STEPS.map((item) => (
              <li
                key={item.step}
                className="flex gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:items-start sm:gap-6 sm:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sea font-display text-lg font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-sea px-5 py-3 text-sm font-semibold text-white hover:bg-sea-dark"
            >
              Start now — Register <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-blue-50"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100/70 bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-center text-3xl font-bold text-ink">What you get</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            Everything a student needs in one platform — simple, organized, and Somali-friendly.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: 'Interactive courses',
                body: 'Structured lessons from basics to exam topics across five subjects.',
              },
              {
                icon: Sparkles,
                title: 'Practice exercises',
                body: 'Multiple choice, true/false, and short answers with instant feedback.',
              },
              {
                icon: Bot,
                title: 'AI tutor',
                body: 'Ask questions anytime. Get hints and explanations in simple Somali.',
              },
              {
                icon: ChartColumnIncreasing,
                title: 'Progress tracking',
                body: 'See completed lessons, exercise scores, and your overall improvement.',
              },
              {
                icon: Languages,
                title: 'Somali-friendly',
                body: 'Ideas explained in Somali; technical terms kept in English where needed.',
              },
              {
                icon: GraduationCap,
                title: 'Built for students',
                body: 'Clean design that works on phone and laptop — study anywhere.',
              },
            ].map((f) => (
              <article key={f.title} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <f.icon className="h-6 w-6 text-sea" />
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-sea">
              Testimonials
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">Students who use the platform</h2>
            <p className="mt-3 text-muted">Real stories from learners who improved with Somali AI Tutor.</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="relative rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-blue-100" aria-hidden />
                <div className="flex gap-1 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-blue-50 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sea-light font-display text-sm font-bold text-sea">
                    {t.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{t.name}</div>
                    <div className="text-xs text-muted">{t.subject}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-sea-dark to-sea px-6 py-10 text-white sm:px-10">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to start learning?</h2>
          <p className="mt-2 max-w-xl text-blue-50">
            Create your free student account today, or log in if you already joined.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sea-dark hover:bg-blue-50"
            >
              <UserPlus className="h-4 w-4" />
              Register as Student
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-blue-100 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <BrandLogo to="/" size="md" subtitle="Baro · Learning Platform" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Somali AI Learning Tutor — a simple platform for students to learn, practice, ask AI, and
                track progress across five school subjects.
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                Navigation
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-muted hover:text-sea">
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/register" className="text-muted hover:text-sea">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-muted hover:text-sea">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                Subjects
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Physics</li>
                <li>Biology</li>
                <li>English</li>
                <li>Chemistry</li>
                <li>Mathematics</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-blue-100 pt-8 text-center text-sm text-muted sm:flex-row sm:text-left">
            <p>© {new Date().getFullYear()} Somali AI Learning Tutor. All rights reserved.</p>
            <p className="font-medium text-sea">
              LEARN → PRACTICE → ASK → IMPROVE → TRACK → COMPLETE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
