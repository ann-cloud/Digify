'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Role } from '@prisma/client';
import { Spinner } from './Spinner';

type HeaderUser = { id: string; name: string; email: string; role: Role } | null;

export function Header({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggingOut(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="glass sticky top-3 z-20 mx-3 md:mx-6 mt-3 rounded-xl">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <DigifyMark />
          <span className="font-bold text-lg tracking-tight">Digify</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/products" className="link">Browse</Link>
          <Link href="/categories" className="link">Categories</Link>
          {user?.role === 'SELLER' && <Link href="/seller" className="link">Sell</Link>}
          {user?.role === 'ADMIN' && <Link href="/admin" className="link">Admin</Link>}
          {user && user.role === 'BUYER' && <Link href="/orders" className="link">Library</Link>}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/cart"
            aria-label="Cart"
            className="px-3 py-2 rounded-full hover:bg-black/[0.04] transition-colors text-sm font-medium"
          >
            Cart
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex tag tag-accent">
                {user.role.toLowerCase()} · {user.name.split(' ')[0]}
              </span>
              <button onClick={logout} disabled={loggingOut} className="btn btn-ghost text-sm py-2">
                {loggingOut ? <Spinner size="sm" /> : 'Sign out'}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium px-3 py-2 link">Sign in</Link>
              <Link href="/register" className="btn btn-accent text-sm py-2">Join</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function DigifyMark() {
  return (
    <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
      <span
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(139, 92, 246) 100%)',
        }}
      />
      <svg
        viewBox="0 0 24 24"
        className="relative w-4 h-4 text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 4h7a8 8 0 010 16H5V4zm3 3v10h4a5 5 0 000-10H8z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
