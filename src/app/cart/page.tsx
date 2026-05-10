'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCart, removeFromCart, clearCart } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { Spinner, InlineLoader } from '@/components/Spinner';

type CartProduct = {
  id: string;
  title: string;
  slug: string;
  price: string;
  coverImage: string | null;
  seller: { name: string };
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = async () => {
      setLoading(true);
      const cart = getCart();
      if (cart.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: cart.map((c) => c.productId) }),
      });
      const data = await res.json();
      setItems(data.products || []);
      setLoading(false);
    };
    sync();
    window.addEventListener('cart-changed', sync);
    return () => window.removeEventListener('cart-changed', sync);
  }, []);

  const total = items.reduce((s, p) => s + parseFloat(p.price), 0);

  async function checkout() {
    setError('');
    setCheckingOut(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: items.map((p) => p.id) }),
    });
    if (!res.ok) {
      setCheckingOut(false);
      const j = await res.json();
      setError(j.error || 'Checkout failed');
      return;
    }
    clearCart();
    const j = await res.json();
    router.push(`/orders/${j.orderId}`);
  }

  return (
    <div className="container-custom py-12 md:py-16 max-w-4xl">
      <p className="label">Your cart</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10">Cart</h1>

      {loading ? (
        <div className="card">
          <InlineLoader message="Loading your cart…" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-xl font-bold mb-2">Your cart is empty</p>
          <Link href="/products" className="link text-accent">Browse the shop →</Link>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-black/[0.06]">
            {items.map((p) => (
              <div key={p.id} className="p-5 flex gap-4 items-center">
                <Link
                  href={`/products/${p.slug}`}
                  className="w-16 h-20 rounded-md bg-gradient-to-br from-surface-2 to-bg overflow-hidden shrink-0"
                >
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${p.slug}`} className="font-bold link">
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted">By {p.seller.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(p.price)}</p>
                  <button
                    onClick={() => removeFromCart(p.id)}
                    className="text-xs text-muted hover:text-red-600 transition-colors mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6 items-end">
            <div className="text-sm text-muted">
              <p>This is a coursework demo — no real charge will be made.</p>
            </div>
            <div className="text-right">
              <p className="label">Total</p>
              <p className="text-4xl font-bold mb-4">{formatPrice(total)}</p>
              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-3 text-left">
                  {error}
                </p>
              )}
              <button onClick={checkout} disabled={checkingOut} className="btn btn-accent">
                {checkingOut ? <><Spinner size="sm" /> Processing…</> : 'Checkout'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
