'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
      }),
    });
    if (!res.ok) {
      setLoading(false);
      const j = await res.json();
      setError(j.error || 'Failed to sign in');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="container-custom py-12 md:py-20 max-w-md">
      <p className="label">Welcome back</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Sign in</h1>
      <form onSubmit={onSubmit} className="card p-6 md:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="input" />
        </div>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}
        <button disabled={loading} className="btn btn-accent w-full">
          {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted text-center">
        New here? <Link href="/register" className="link text-accent">Create an account</Link>
      </p>

      <div className="mt-8 card p-5">
        <p className="label mb-3">Demo accounts</p>
        <ul className="text-xs font-mono space-y-1.5 text-muted">
          <li>admin@market.io / admin123</li>
          <li>maria@market.io / seller123</li>
          <li>ivan@market.io / buyer123</li>
        </ul>
      </div>
    </div>
  );
}
