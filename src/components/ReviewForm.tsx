'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from './Spinner';

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json();
      setError(j.error || 'Failed to post review');
      return;
    }
    setComment('');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-4">
      <div>
        <label className="label" htmlFor="rating">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl transition-all ${
                n <= rating ? 'text-accent scale-110' : 'text-muted/30'
              }`}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="comment">Comment</label>
        <textarea
          id="comment"
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input"
          placeholder="Share your honest impression…"
        />
      </div>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}
      <button disabled={loading} className="btn btn-accent">
        {loading ? <><Spinner size="sm" /> Posting…</> : 'Post review'}
      </button>
    </form>
  );
}
