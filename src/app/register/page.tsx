'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        password: fd.get('password'),
        role: fd.get('role'),
      }),
    });
    if (!res.ok) {
      setLoading(false);
      const j = await res.json();
      setError(j.error || 'Failed to register');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="container-custom py-12 md:py-20 max-w-md">
      <p className="label">Welcome</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Create an account</h1>
      <form onSubmit={onSubmit} className="card p-6 md:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="role">I want to</label>
          <select id="role" name="role" defaultValue="BUYER" className="input">
            <option value="BUYER">Buy products</option>
            <option value="SELLER">Sell products</option>
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}
        <button disabled={loading} className="btn btn-accent w-full">
          {loading ? <><Spinner size="sm" /> Creating…</> : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted text-center">
        Already have an account? <Link href="/login" className="link text-accent">Sign in</Link>
      </p>
    </div>
  );
}
