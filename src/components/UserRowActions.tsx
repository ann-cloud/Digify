'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './Spinner';

export function UserRowActions({ id, blocked }: { id: string; blocked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'block' | 'delete' | null>(null);

  async function toggleBlock() {
    setBusy('block');
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked: !blocked }),
    });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert('Failed');
  }

  async function del() {
    if (!confirm('Delete this user permanently? Their products and orders will also be removed.')) return;
    setBusy('delete');
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert('Failed');
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={toggleBlock} disabled={!!busy} className="btn btn-ghost text-xs py-2">
        {busy === 'block' ? <Spinner size="sm" /> : (blocked ? 'Unblock' : 'Block')}
      </button>
      <button onClick={del} disabled={!!busy} className="btn btn-ghost text-xs py-2">
        {busy === 'delete' ? <Spinner size="sm" /> : 'Delete'}
      </button>
    </div>
  );
}
