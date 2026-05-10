'use client';

const KEY = 'mkt_cart_v1';

export type CartItem = { productId: string; addedAt: number };

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-changed'));
}

export function addToCart(productId: string) {
  const items = getCart();
  if (items.some((i) => i.productId === productId)) return;
  setCart([...items, { productId, addedAt: Date.now() }]);
}

export function removeFromCart(productId: string) {
  setCart(getCart().filter((i) => i.productId !== productId));
}

export function clearCart() {
  setCart([]);
}
