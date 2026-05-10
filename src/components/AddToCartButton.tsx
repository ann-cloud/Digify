'use client';
import { useEffect, useState } from 'react';
import { addToCart, getCart, removeFromCart } from '@/lib/cart';
import { Spinner } from './Spinner';
import Link from 'next/link';

export function AddToCartButton({ productId }: { productId: string }) {
  const [inCart, setInCart] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setInCart(getCart().some((i) => i.productId === productId));
    sync();
    window.addEventListener('cart-changed', sync);
    return () => window.removeEventListener('cart-changed', sync);
  }, [productId]);

  function add() {
    setBusy(true);
    addToCart(productId);
    setTimeout(() => setBusy(false), 250);
  }

  function remove() {
    setBusy(true);
    removeFromCart(productId);
    setTimeout(() => setBusy(false), 250);
  }

  if (inCart) {
    return (
      <div className="flex gap-3">
        <Link href="/cart" className="btn btn-accent">In cart — view cart</Link>
        <button onClick={remove} disabled={busy} className="btn btn-ghost">
          {busy ? <Spinner size="sm" /> : 'Remove'}
        </button>
      </div>
    );
  }

  return (
    <button onClick={add} disabled={busy} className="btn btn-accent">
      {busy ? <Spinner size="sm" /> : 'Add to cart'}
    </button>
  );
}
