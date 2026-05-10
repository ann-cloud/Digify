'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './Spinner';

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert('Failed to delete');
  }

  return (
    <button onClick={onDelete} disabled={busy} className="btn btn-ghost text-xs py-2">
      {busy ? <Spinner size="sm" /> : 'Delete'}
    </button>
  );
}
