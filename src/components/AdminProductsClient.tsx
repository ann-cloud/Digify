'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import { formatPrice } from '@/lib/utils';
import { formatBytes } from '@/lib/blob';

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  type: string;
  status: string;
  coverImage: string | null;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  fileMimeType: string | null;
  createdAt: string;
  seller: { id: string; name: string; email: string; bio: string | null };
  category: { id: string; name: string; slug: string };
  reviews: { rating: number }[];
};

export function AdminProductsClient({
  products,
  currentStatus,
}: {
  products: AdminProduct[];
  currentStatus?: string;
}) {
  const [selected, setSelected] = useState<AdminProduct | null>(null);

  return (
    <div className="container-custom py-12 md:py-16">
      <p className="label">Admin</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Products</h1>

      <nav className="flex gap-2 mb-8 flex-wrap">
        <FilterTab href="/admin/products" active={!currentStatus}>All</FilterTab>
        <FilterTab href="/admin/products?status=PENDING" active={currentStatus === 'PENDING'}>
          Pending
        </FilterTab>
        <FilterTab href="/admin/products?status=APPROVED" active={currentStatus === 'APPROVED'}>
          Approved
        </FilterTab>
        <FilterTab href="/admin/products?status=REJECTED" active={currentStatus === 'REJECTED'}>
          Rejected
        </FilterTab>
      </nav>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted">No products to show.</p>
        </div>
      ) : (
        <div className="card divide-y divide-black/[0.06] overflow-hidden">
          {products.map((p) => (
            <div key={p.id} className="p-5 grid grid-cols-12 gap-4 items-center hover:bg-black/[0.02] transition-colors">
              <button
                onClick={() => setSelected(p)}
                className="col-span-12 md:col-span-5 flex gap-4 items-center text-left"
              >
                <div className="w-14 h-16 rounded-md bg-gradient-to-br from-surface-2 to-bg overflow-hidden shrink-0">
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate hover:text-accent transition-colors">{p.title}</p>
                  <p className="text-xs text-muted">
                    by {p.seller.name} · {p.category.name}
                  </p>
                </div>
              </button>
              <div className="col-span-3 md:col-span-2 text-sm font-medium">
                {formatPrice(p.price)}
              </div>
              <div className="col-span-4 md:col-span-2">
                <span className={
                  'tag ' +
                  (p.status === 'APPROVED' ? 'tag-approved'
                    : p.status === 'PENDING' ? 'tag-pending'
                    : 'tag-rejected')
                }>
                  {p.status.toLowerCase()}
                </span>
              </div>
              <div className="col-span-12 md:col-span-3 flex gap-2 justify-end flex-wrap">
                <button
                  onClick={() => setSelected(p)}
                  className="btn btn-ghost text-xs py-2"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductPreviewModal
        product={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function FilterTab({
  href, active, children,
}: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        'px-4 py-2 rounded-full text-sm font-medium transition-colors ' +
        (active
          ? 'bg-ink text-white'
          : 'bg-white border border-black/[0.08] hover:border-black/[0.15] text-ink')
      }
    >
      {children}
    </Link>
  );
}

function ProductPreviewModal({
  product, onClose,
}: { product: AdminProduct | null; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | 'approve' | 'reject' | 'delete'>(null);

  if (!product) return null;

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  async function setStatus(newStatus: 'APPROVED' | 'REJECTED') {
    if (!product) return;
    setBusy(newStatus === 'APPROVED' ? 'approve' : 'reject');
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusy(null);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      alert('Action failed');
    }
  }

  async function del() {
    if (!product) return;
    if (!confirm(`Delete "${product.title}" permanently? This cannot be undone.`)) return;
    setBusy('delete');
    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      alert('Delete failed');
    }
  }

  return (
    <Modal open onClose={onClose} title="Product preview">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image / cover */}
        <div className="aspect-square bg-gradient-to-br from-surface-2 to-bg px-3 py-3">
          {product.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.coverImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-9xl font-bold text-muted/20">
              {product.title[0]}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="tag">{product.type.toLowerCase()}</span>
            <span
              className={
                'tag ' +
                (product.status === 'APPROVED' ? 'tag-approved'
                  : product.status === 'PENDING' ? 'tag-pending'
                  : 'tag-rejected')
              }
            >
              {product.status.toLowerCase()}
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight leading-tight">{product.title}</h2>

          <p className="mt-2 text-sm text-muted">
            By <span className="text-ink font-medium">{product.seller.name}</span>
            {' · '}
            <span>{product.category.name}</span>
          </p>

          <p className="mt-4 text-2xl font-bold">
            {formatPrice(product.price)}
          </p>

          {avg !== null && (
            <p className="mt-2 text-sm text-muted">
              ★ {avg.toFixed(1)} ({product.reviews.length} reviews)
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-black/[0.06]">
            <p className="label">Description</p>
            <p className="text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* File info — admin can verify the digital good */}
          <div className="mt-6 pt-6 border-t border-black/[0.06]">
            <p className="label">Product file</p>
            <div className="rounded-md bg-surface-2 p-4 text-sm">
              <p className="font-mono text-xs truncate text-muted">
                {product.fileName || product.fileUrl.split('/').pop()}
              </p>
              <p className="text-xs text-muted mt-1">
                {product.fileMimeType || 'unknown type'}
                {product.fileSize ? ` · ${formatBytes(product.fileSize)}` : ''}
              </p>
              <a
                href={`/api/download/${product.id}`}
                className="btn btn-ghost text-xs mt-3 py-1.5"
                target="_blank"
                rel="noreferrer"
              >
                Download to review →
              </a>
            </div>
          </div>

          {product.seller.bio && (
            <div className="mt-6 pt-6 border-t border-black/[0.06]">
              <p className="label">About the seller</p>
              <p className="text-sm text-muted">{product.seller.bio}</p>
              <p className="text-xs font-mono text-muted mt-1">{product.seller.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 glass-strong border-t border-black/[0.06] px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted">
          Submitted {new Date(product.createdAt).toLocaleString()}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={del}
            disabled={!!busy}
            className="btn btn-ghost text-sm py-2"
          >
            {busy === 'delete' ? <Spinner size="sm" /> : 'Delete'}
          </button>
          {product.status !== 'REJECTED' && (
            <button
              onClick={() => setStatus('REJECTED')}
              disabled={!!busy}
              className="btn btn-ghost text-sm py-2"
            >
              {busy === 'reject' ? <Spinner size="sm" /> : 'Reject'}
            </button>
          )}
          {product.status !== 'APPROVED' && (
            <button
              onClick={() => setStatus('APPROVED')}
              disabled={!!busy}
              className="btn btn-accent text-sm py-2"
            >
              {busy === 'approve' ? <Spinner size="sm" /> : 'Approve'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
