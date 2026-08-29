import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { ErrorBox } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('ahmed@student.so');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Gal akoonkaaga"
      subtitle="Login arday ama admin ahaan"
      footer={
        <>
          Akoon ma lihid?{' '}
          <Link to="/register" className="font-semibold text-sea hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sea py-3 text-sm font-semibold text-white hover:bg-sea-dark disabled:opacity-60"
        >
          {loading ? 'Gelenaya...' : 'Login'}
        </button>
        <div className="rounded-xl bg-sea-light/70 p-3 text-xs text-sea-dark">
          <div>Student: ahmed@student.so / password123</div>
          <div>Admin: admin@somalilearn.so / password123</div>
        </div>
      </form>
    </AuthCard>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Isdiiwaangeli"
      subtitle="Samee akoon arday cusub"
      footer={
        <>
          Horey ma ku jirtaa?{' '}
          <Link to="/login" className="font-semibold text-sea hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}
        <Field label="Magaca" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sea py-3 text-sm font-semibold text-white hover:bg-sea-dark disabled:opacity-60"
        >
          {loading ? 'Abuuraya...' : 'Register'}
        </button>
      </form>
    </AuthCard>
  );
}

function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sea font-display font-bold text-white">
            S
          </span>
          <span className="font-display font-bold text-ink">Somali AI Tutor</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-5 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-teal-100 bg-slate-50 px-3 py-2.5 outline-none ring-sea focus:bg-white focus:ring-2"
      />
    </label>
  );
}
