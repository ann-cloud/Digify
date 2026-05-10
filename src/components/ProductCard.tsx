import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

type ProductLike = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: any;
  type: string;
  status?: string;
  coverImage: string | null;
  seller: { name: string };
  category: { name: string; slug: string };
  reviews?: { rating: number }[];
};

export function ProductCard({
  product,
  href,
  onClick,
  showStatus,
}: {
  product: ProductLike;
  /** Override the default href; useful for admin previews */
  href?: string;
  /** Override navigation entirely (e.g. for opening a modal) */
  onClick?: () => void;
  /** Show approval status badge — used in admin/seller views */
  showStatus?: boolean;
}) {
  const reviews = product.reviews ?? [];
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  const inner = (
    <>
      <div className="aspect-[4/5] bg-gradient-to-br from-surface-2 to-bg overflow-hidden relative">
        {product.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl font-bold text-muted/30">
            {product.title[0]}
          </div>
        )}
        <span className="absolute top-3 left-3 tag glass-strong">
          {product.type.toLowerCase()}
        </span>
        {showStatus && product.status && (
          <span
            className={
              'absolute top-3 right-3 tag ' +
              (product.status === 'APPROVED' ? 'tag-approved'
                : product.status === 'PENDING' ? 'tag-pending'
                : 'tag-rejected')
            }
          >
            {product.status.toLowerCase()}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">
          {product.category.name} · {product.seller.name}
        </p>
        <h3 className="text-lg font-bold mt-2 leading-snug tracking-tight">{product.title}</h3>
        <p className="text-sm text-muted mt-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/[0.06]">
          <span className="text-lg font-bold">{formatPrice(product.price.toString())}</span>
          {avg !== null && (
            <span className="text-xs text-muted">
              ★ {avg.toFixed(1)} <span className="opacity-60">({reviews.length})</span>
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="card group block text-left w-full">
        {inner}
      </button>
    );
  }

  return (
    <Link href={href || `/products/${product.slug}`} className="card group block">
      {inner}
    </Link>
  );
}
