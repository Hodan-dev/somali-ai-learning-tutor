import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getToken } from '../lib/api';
import { Badge, ErrorBox, Loading, ProgressBar } from '../components/ui';

export function AdminDashboard() {
  const [data, setData] = useState<{
    stats: { totalStudents: number; totalCourses: number; totalLessons: number; totalExercises: number };
    recentStudents: Array<{ name: string; email: string }>;
    recentLessons: Array<{ title: string; course_title: string }>;
    recentActivity: Array<{ student_name: string; detail: string; action: string }>;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<NonNullable<typeof data>>('/api/admin/stats')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const cards = [
    { label: 'Total Students', value: data.stats.totalStudents },
    { label: 'Total Courses', value: data.stats.totalCourses },
    { label: 'Total Lessons', value: data.stats.totalLessons },
    { label: 'Total Exercises', value: data.stats.totalExercises },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-muted">Maamul koorsooyinka, casharrada, layliyada, iyo ardayda.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-blue-100 bg-white p-5">
            <div className="text-xs text-muted">{c.label}</div>
            <div className="mt-1 font-display text-3xl font-bold text-sea">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Recent Students">
          {data.recentStudents.map((s, i) => (
            <div key={i} className="text-sm">
              <div className="font-medium">{s.name}</div>
              <div className="text-muted">{s.email}</div>
            </div>
          ))}
        </Panel>
        <Panel title="Recent Lessons">
          {data.recentLessons.map((l, i) => (
            <div key={i} className="text-sm">
              <div className="font-medium">{l.title}</div>
              <div className="text-muted">{l.course_title}</div>
            </div>
          ))}
        </Panel>
        <Panel title="Recent Activity">
          {data.recentActivity.map((a, i) => (
            <div key={i} className="text-sm">
              <div className="font-medium">{a.student_name}</div>
              <div className="text-muted">{a.detail || a.action}</div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5">
      <h2 className="font-display font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<
    Array<{ id: string; title: string; description: string; category: string; difficulty: string; lessonCount: number }>
  >([]);
  const [modules, setModules] = useState<
    Array<{ id: string; title: string; course_id: string; course_title: string }>
  >([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Physics',
    difficulty: 'Beginner',
  });
  const [moduleForm, setModuleForm] = useState({ courseId: '', title: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [c, m] = await Promise.all([
      api<{ courses: typeof courses }>('/api/courses'),
      api<{ modules: typeof modules }>('/api/admin/modules'),
    ]);
    setCourses(c.courses);
    setModules(m.modules);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function createCourse(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api('/api/courses', { method: 'POST', json: form });
      setForm({ title: '', description: '', category: 'Physics', difficulty: 'Beginner' });
      setMsg('Koorso waa la abuuray.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function createModule(e: FormEvent) {
    e.preventDefault();
    try {
      await api(`/api/courses/${moduleForm.courseId}/modules`, {
        method: 'POST',
        json: { title: moduleForm.title },
      });
      setModuleForm({ courseId: '', title: '' });
      setMsg('Module waa la abuuray.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete course?')) return;
    await api(`/api/courses/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Koorsooyinka</h1>
      {error && <ErrorBox message={error} />}
      {msg && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{msg}</div>}

      <form onSubmit={createCourse} className="grid gap-3 rounded-2xl border border-blue-100 bg-white p-5 md:grid-cols-2">
        <h2 className="font-display text-lg font-semibold md:col-span-2">Create Course</h2>
        <input
          className="input"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <select
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {['Physics', 'Biology', 'English', 'Chemistry', 'Mathematics'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <textarea
          className="input md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <select
          className="input"
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
        >
          {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white">
          Create
        </button>
      </form>

      <form onSubmit={createModule} className="grid gap-3 rounded-2xl border border-blue-100 bg-white p-5 md:grid-cols-3">
        <h2 className="font-display text-lg font-semibold md:col-span-3">Add Module</h2>
        <select
          className="input"
          value={moduleForm.courseId}
          onChange={(e) => setModuleForm({ ...moduleForm, courseId: e.target.value })}
          required
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Module title"
          value={moduleForm.title}
          onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
          required
        />
        <button type="submit" className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white">
          Add Module
        </button>
      </form>

      <div className="grid gap-3">
        {courses.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4">
            <div>
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-muted">
                {c.category} · {c.difficulty} · {c.lessonCount} lessons
              </div>
            </div>
            <button type="button" onClick={() => remove(c.id)} className="text-sm text-danger hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-4">
        <h3 className="font-semibold">Modules</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {modules.map((m) => (
            <li key={m.id}>
              {m.course_title} → {m.title} <span className="text-xs text-muted">({m.id.slice(0, 8)})</span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid #d5e3e2;padding:0.65rem 0.85rem;background:#f8fafc}`}</style>
    </div>
  );
}

export function AdminLessonsPage() {
  const [lessons, setLessons] = useState<
    Array<{ id: string; title: string; course_title: string; module_title: string; pdf_url?: string; status: string }>
  >([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string; course_title: string }>>([]);
  const [moduleId, setModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [l, m] = await Promise.all([
      api<{ lessons: typeof lessons }>('/api/lessons'),
      api<{ modules: typeof modules }>('/api/admin/modules'),
    ]);
    setLessons(l.lessons);
    setModules(m.modules);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function uploadPdf(e: FormEvent) {
    e.preventDefault();
    if (!file || !moduleId || !title) return;
    setError('');
    const fd = new FormData();
    fd.append('pdf', file);
    fd.append('moduleId', moduleId);
    fd.append('title', title);
    fd.append('description', description);
    const res = await fetch('/api/lessons/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Upload failed');
      return;
    }
    setMsg(`PDF uploaded: ${data.lesson.title} (${data.lesson.extractedChars} chars extracted)`);
    setTitle('');
    setDescription('');
    setFile(null);
    await load();
  }

  async function addTextLesson(e: FormEvent) {
    e.preventDefault();
    await api('/api/lessons', {
      method: 'POST',
      json: { moduleId, title, description, content },
    });
    setMsg('Lesson created.');
    setContent('');
    setTitle('');
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete lesson?')) return;
    await api(`/api/lessons/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Casharrada</h1>
      {error && <ErrorBox message={error} />}
      {msg && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{msg}</div>}

      <form onSubmit={uploadPdf} className="space-y-3 rounded-2xl border border-blue-100 bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Upload Lesson PDF</h2>
        <select className="w-full rounded-xl border border-blue-100 px-3 py-2" value={moduleId} onChange={(e) => setModuleId(e.target.value)} required>
          <option value="">Select module</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.course_title} — {m.title}
            </option>
          ))}
        </select>
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        <button type="submit" className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white">
          Upload & Process PDF
        </button>
      </form>

      <form onSubmit={addTextLesson} className="space-y-3 rounded-2xl border border-blue-100 bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Add Text Lesson</h2>
        <select className="w-full rounded-xl border border-blue-100 px-3 py-2" value={moduleId} onChange={(e) => setModuleId(e.target.value)} required>
          <option value="">Select module</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.course_title} — {m.title}
            </option>
          ))}
        </select>
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded-xl border border-blue-100 px-3 py-2" rows={6} placeholder="Markdown content..." value={content} onChange={(e) => setContent(e.target.value)} required />
        <button type="submit" className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white">
          Create Lesson
        </button>
      </form>

      <div className="space-y-2">
        {lessons.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-white p-4">
            <div>
              <div className="font-medium">{l.title}</div>
              <div className="text-xs text-muted">
                {l.course_title} · {l.module_title} · {l.status}
                {l.pdf_url ? ' · PDF' : ''}
              </div>
            </div>
            <button type="button" onClick={() => remove(l.id)} className="text-sm text-danger">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminExercisesPage() {
  const [exercises, setExercises] = useState<
    Array<{ id: string; title: string; lesson_title: string; course_title: string; question_count: number }>
  >([]);
  const [lessons, setLessons] = useState<Array<{ id: string; title: string; course_title: string }>>([]);
  const [lessonId, setLessonId] = useState('');
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('A, B, C, D');
  const [correct, setCorrect] = useState('');
  const [hint, setHint] = useState('');
  const [explanation, setExplanation] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const [e, l] = await Promise.all([
      api<{ exercises: typeof exercises }>('/api/exercises'),
      api<{ lessons: typeof lessons }>('/api/lessons'),
    ]);
    setExercises(e.exercises);
    setLessons(l.lessons);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    const opts = options.split(',').map((s) => s.trim()).filter(Boolean);
    await api('/api/exercises', {
      method: 'POST',
      json: {
        lessonId,
        title,
        questions: [
          {
            question,
            type: opts.length ? 'multiple_choice' : 'short_answer',
            options: opts.length ? opts : undefined,
            correctAnswer: correct,
            hint,
            explanation,
          },
        ],
      },
    });
    setMsg('Exercise created.');
    setTitle('');
    setQuestion('');
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Layliyada</h1>
      {msg && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{msg}</div>}
      <form onSubmit={create} className="space-y-3 rounded-2xl border border-blue-100 bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Create Exercise</h2>
        <select className="w-full rounded-xl border border-blue-100 px-3 py-2" value={lessonId} onChange={(e) => setLessonId(e.target.value)} required>
          <option value="">Select lesson</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.course_title} — {l.title}
            </option>
          ))}
        </select>
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Exercise title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Options (comma-separated, optional)" value={options} onChange={(e) => setOptions(e.target.value)} />
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Correct answer" value={correct} onChange={(e) => setCorrect(e.target.value)} required />
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Hint" value={hint} onChange={(e) => setHint(e.target.value)} />
        <input className="w-full rounded-xl border border-blue-100 px-3 py-2" placeholder="Explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        <button type="submit" className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white">
          Create
        </button>
      </form>
      <div className="space-y-2">
        {exercises.map((ex) => (
          <div key={ex.id} className="rounded-xl border border-blue-100 bg-white p-4">
            <div className="font-medium">{ex.title}</div>
            <div className="text-xs text-muted">
              {ex.course_title} · {ex.lesson_title} · {ex.question_count} questions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; email: string; overallProgress: number; lessonsCompleted: number }>
  >([]);

  useEffect(() => {
    api<{ students: typeof students }>('/api/admin/students').then((d) => setStudents(d.students));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Ardayda</h1>
      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sea-light text-sea-dark">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-blue-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted">{s.email}</td>
                <td className="px-4 py-3">{s.overallProgress}%</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/students/${s.id}`} className="font-medium text-sea hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminStudentDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<{
    student: { name: string; email: string };
    overallProgress: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    exercisesCompleted: number;
    averageScore: number;
    courses: Array<{ title: string; category: string; progress: number }>;
  } | null>(null);

  useEffect(() => {
    api<NonNullable<typeof data>>(`/api/admin/students/${id}/progress`).then(setData);
  }, [id]);

  if (!data) return <Loading />;

  return (
    <div className="space-y-6">
      <Link to="/admin/students" className="text-sm text-sea hover:underline">
        ← Back
      </Link>
      <div className="rounded-2xl border border-blue-100 bg-white p-6">
        <h1 className="font-display text-3xl font-bold">Student: {data.student.name}</h1>
        <p className="text-muted">{data.student.email}</p>
        <div className="mt-4 max-w-md">
          <div className="mb-2 flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-semibold text-sea">{data.overallProgress}%</span>
          </div>
          <ProgressBar value={data.overallProgress} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Badge>
            Lessons: {data.lessonsCompleted}/{data.lessonsTotal}
          </Badge>
          <Badge tone="amber">Exercises: {data.exercisesCompleted}</Badge>
          <Badge tone="ink">Avg Score: {data.averageScore}%</Badge>
        </div>
      </div>
      <div className="space-y-3">
        {data.courses.map((c, i) => (
          <div key={i} className="rounded-xl border border-blue-100 bg-white p-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">
                {c.title} · {c.category}
              </span>
              <span className="text-sea">{c.progress}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={c.progress} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
