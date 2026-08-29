import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChartColumnIncreasing,
  GraduationCap,
  Languages,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sea font-display text-lg font-bold text-white">
            S
          </span>
          <span className="font-display text-lg font-bold text-ink">Somali AI Learning Tutor</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-white/70">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white hover:bg-sea-dark"
          >
            Start Learning
          </Link>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-10">
        <div className="relative z-10">
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-sea">
            Somali AI Learning Tutor
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Learn Smarter with Your Somali AI Tutor
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Baro maadooyinkaaga, samee layliyada, weydii AI Tutor-ka su&apos;aalahaaga, oo la soco
            horumarkaaga.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-sea px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sea-dark"
            >
              Start Learning <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white/80 px-5 py-3 text-sm font-semibold text-ink hover:bg-white"
            >
              Explore Courses
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl px-4 py-3 text-sm font-medium text-sea hover:underline"
            >
              Login
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Maadooyinka: Physics · Biology · English · Chemistry · Mathematics
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-sea to-sea-dark p-1 shadow-[0_30px_80px_-40px_rgba(11,122,117,0.7)]">
          <div className="relative overflow-hidden rounded-[1.85rem] bg-[#0a5f5b] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/30 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Bot className="h-3.5 w-3.5" /> Macallinka AI · Cashar-aware
              </div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Baro → Layli → Weydii AI → Horumar
              </h2>
              <div className="space-y-3 text-sm text-teal-50">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                  <div className="text-xs text-teal-100">Arday</div>
                  Maxaan u isticmaalaa force ee Physics?
                </div>
                <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                  <div className="text-xs text-amber-200">Macallinka AI</div>
                  Force waa xoog riixa ama jiida shay... Aan tallaabo tallaabo u eegno F = m × a.
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="rounded-xl bg-black/15 p-3">
                  <div className="font-display text-lg font-bold">5</div>Koorso
                </div>
                <div className="rounded-xl bg-black/15 p-3">
                  <div className="font-display text-lg font-bold">AI</div>Tutor
                </div>
                <div className="rounded-xl bg-black/15 p-3">
                  <div className="font-display text-lg font-bold">SO</div>Somali
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-teal-100/70 bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-center text-3xl font-bold text-ink">Maxaad ku heli doontaa?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            Platform waxbarasho oo fudud: casharro, layliyo, Macallin AI, iyo horumar cad.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: 'Interactive Courses',
                body: 'Casharro nidaamsan oo tallaabo tallaabo ah — Physics ilaa Mathematics.',
              },
              {
                icon: Sparkles,
                title: 'Practice Exercises',
                body: 'Layliyo multiple choice, true/false, iyo short answer oo feedback degdeg ah leh.',
              },
              {
                icon: Bot,
                title: 'AI Tutor',
                body: "Weydii su'aalahaaga wakhti kasta. Hint iyo sharaxaad Somali ah.",
              },
              {
                icon: ChartColumnIncreasing,
                title: 'Progress Tracking',
                body: 'Arag casharrada la dhammeeyay, dhibcaha layliyada, iyo horumarka guud.',
              },
              {
                icon: Languages,
                title: 'Somali-Friendly Learning',
                body: 'Fikradaha waxaa lagu sharxaa Somali fudud; ereyada farsamada ayaa English ah.',
              },
              {
                icon: GraduationCap,
                title: 'Admin Content Tools',
                body: 'Admin wuxuu abuuri karaa koorsooyin, PDF casharro, iyo layliyo.',
              },
            ].map((f) => (
              <article key={f.title} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
                <f.icon className="h-6 w-6 text-sea" />
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-sea-dark to-sea px-6 py-10 text-white sm:px-10">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Diyaar ma u tahay inaad bilowdo?</h2>
          <p className="mt-2 max-w-xl text-teal-50">
            Isdiiwaangeli arday ahaan, ama gal admin ahaan si aad u maamusho casharrada.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sea-dark hover:bg-amber-50"
            >
              Register as Student
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Admin / Student Login
            </Link>
          </div>
          <p className="mt-5 text-xs text-teal-100">
            Demo: ahmed@student.so / password123 · admin@somalilearn.so / password123
          </p>
        </div>
      </section>

      <footer className="border-t border-teal-100 py-8 text-center text-sm text-muted">
        Somali AI Learning Tutor · LEARN → PRACTICE → ASK → IMPROVE → TRACK → COMPLETE
      </footer>
    </div>
  );
}
