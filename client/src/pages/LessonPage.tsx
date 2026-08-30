import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bot, Check, Menu, Send, Trash2, X } from 'lucide-react';
import { api, getToken } from '../lib/api';
import { Badge, ErrorBox, LessonContent, Loading } from '../components/ui';
import { PdfViewer } from '../components/PdfViewer';

interface LessonData {
  lesson: {
    id: string;
    title: string;
    content: string;
    pdf_url?: string;
    course_id: string;
    course_title: string;
    module_title: string;
    category: string;
    completed: boolean;
    exercise?: { id: string; title: string } | null;
  };
  curriculum: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string; completed: boolean; current: boolean }>;
  }>;
}

interface ChatMsg {
  sender: 'student' | 'ai';
  message: string;
}

export function LessonPage() {
  const { id } = useParams();
  const [data, setData] = useState<LessonData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');

  // AI chat
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: 'ai', message: 'Salaan! 👋 Waxaan kaa caawin karaa casharkan. Weydii wax kasta.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api<LessonData>(`/api/lessons/${id}`)
      .then((d) => {
        setData(d);
        setDoneMsg(d.lesson.completed ? 'Casharkan waa la dhammeeyay ✓' : '');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    api<{ chatId: string | null; messages: ChatMsg[] }>(`/api/ai/history?lessonId=${id}`)
      .then((h) => {
        if (h.chatId && h.messages.length) {
          setChatId(h.chatId);
          setMessages(h.messages.map((m) => ({ sender: m.sender, message: m.message })));
        } else {
          setChatId(null);
          setMessages([
            { sender: 'ai', message: 'Salaan! 👋 Waxaan kaa caawin karaa casharkan. Weydii wax kasta.' },
          ]);
        }
      })
      .catch(() => undefined);
  }, [id]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function completeLesson() {
    if (!id) return;
    setCompleting(true);
    try {
      const res = await api<{ courseCompleted: boolean; progress: number }>(`/api/lessons/${id}/complete`, {
        method: 'POST',
      });
      setDoneMsg(
        res.courseCompleted
          ? '🎉 Hambalyo! Koorsada waad dhammaysay!'
          : `✓ Casharka waa la dhammeeyay · Horumar: ${res.progress}%`
      );
      setData((prev) => (prev ? { ...prev, lesson: { ...prev.lesson, completed: true } } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCompleting(false);
    }
  }

  async function sendChat(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || !data) return;
    const question = input.trim();
    setInput('');
    setMessages((m) => [...m, { sender: 'student', message: question }]);
    setTyping(true);
    try {
      const res = await api<{ chatId: string; reply: string }>('/api/ai/chat', {
        method: 'POST',
        json: {
          message: question,
          ...(chatId ? { chatId } : {}),
          lessonId: data.lesson.id,
          courseId: data.lesson.course_id,
        },
      });
      setChatId(res.chatId);
      setMessages((m) => [...m, { sender: 'ai', message: res.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { sender: 'ai', message: err instanceof Error ? err.message : 'Khalad ayaa dhacay.' },
      ]);
    } finally {
      setTyping(false);
    }
  }

  async function clearChat() {
    if (chatId) {
      await api(`/api/ai/history?chatId=${chatId}`, { method: 'DELETE' }).catch(() => undefined);
    }
    setChatId(null);
    setMessages([
      { sender: 'ai', message: 'Salaan! 👋 Waxaan kaa caawin karaa casharkan. Weydii wax kasta.' },
    ]);
  }

  if (loading) return <Loading />;
  if (error && !data) return <ErrorBox message={error} />;
  if (!data) return null;

  const { lesson, curriculum } = data;

  return (
    <div className="relative lg:flex lg:max-h-[calc(100dvh-9.5rem)] lg:min-h-0 lg:gap-5 lg:overflow-hidden">
      {/* Mobile curriculum toggle */}
      <button
        type="button"
        className="mb-3 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" /> Curriculum
      </button>

      {/* Left curriculum */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-blue-100 bg-white p-4 shadow-xl transition lg:relative lg:inset-auto lg:z-auto lg:flex lg:h-full lg:w-60 lg:shrink-0 lg:flex-col lg:rounded-2xl lg:border lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-3 flex items-center justify-between lg:block">
          <div>
            <div className="text-xs font-medium text-muted">{lesson.course_title}</div>
            <div className="font-display font-semibold text-ink">Curriculum</div>
          </div>
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          {curriculum.map((mod) => (
            <div key={mod.id}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sea">{mod.title}</div>
              <ul className="space-y-1">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/app/lessons/${l.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                        l.current ? 'bg-sea-light font-semibold text-sea-dark' : 'text-ink hover:bg-slate-50'
                      }`}
                    >
                      {l.completed ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : l.current ? (
                        <span className="text-sea">→</span>
                      ) : (
                        <span className="w-3.5" />
                      )}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Center content — only this column scrolls on desktop */}
      <section className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-blue-100 bg-white p-5 sm:p-7">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>{lesson.category}</Badge>
          <Badge tone="ink">{lesson.module_title}</Badge>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">{lesson.title}</h1>

        {lesson.pdf_url ? (
          <div className="mt-4">
            <PdfViewer url={lesson.pdf_url} title={lesson.title} />
          </div>
        ) : (
          <LessonContent content={lesson.content} />
        )}

        {doneMsg && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {doneMsg}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={completeLesson}
            disabled={completing || lesson.completed}
            className="rounded-xl bg-sea px-5 py-3 text-sm font-semibold text-white hover:bg-sea-dark disabled:opacity-60"
          >
            {lesson.completed ? 'La dhammeeyay' : completing ? 'Kaydinaya...' : 'Mark as Completed'}
          </button>
          {lesson.exercise && (
            <Link
              to={`/app/exercises/${lesson.exercise.id}`}
              className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-sea-light"
            >
              Practice Exercise
            </Link>
          )}
          <Link
            to={`/app/courses/${lesson.course_id}`}
            className="rounded-xl px-4 py-3 text-sm font-medium text-muted hover:text-ink"
          >
            Back to Course
          </Link>
        </div>
      </section>

      {/* Right AI panel — fixed height; chat scrolls inside */}
      <aside className="mt-5 flex h-[520px] shrink-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white lg:mt-0 lg:h-full lg:w-[300px]">
        <div className="flex items-center justify-between border-b border-blue-50 px-4 py-3">
          <div className="flex items-center gap-2 font-display font-semibold">
            <Bot className="h-5 w-5 text-sea" /> Macallinka AI
          </div>
          <button type="button" onClick={clearChat} className="rounded-lg p-1.5 text-muted hover:bg-slate-50" title="Clear">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm">
          <p className="text-xs text-muted">Context: {lesson.title}</p>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl px-3 py-2 whitespace-pre-wrap ${
                m.sender === 'ai' ? 'bg-sea-light text-ink' : 'ml-6 bg-slate-100 text-ink'
              }`}
            >
              <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {m.sender === 'ai' ? 'AI' : 'Adiga'}
              </div>
              {m.message}
            </div>
          ))}
          {typing && (
            <div className="rounded-xl bg-sea-light px-3 py-2 text-muted">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce [animation-delay:100ms]">·</span>
                <span className="animate-bounce [animation-delay:200ms]">·</span>
              </span>{' '}
              qoraya...
            </div>
          )}
          <div ref={chatEnd} />
        </div>
        <form onSubmit={sendChat} className="border-t border-blue-50 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Weydii AI..."
              className="flex-1 rounded-xl border border-blue-100 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea"
            />
            <button type="submit" className="rounded-xl bg-sea p-2.5 text-white hover:bg-sea-dark" disabled={!getToken()}>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
