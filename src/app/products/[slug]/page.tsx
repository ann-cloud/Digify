import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ReviewForm } from '@/components/ReviewForm';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      seller: true,
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!product || product.status !== 'APPROVED') notFound();

  const user = await getCurrentUser();
  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  let purchased = false;
  if (user && user.role === 'BUYER') {
    const o = await prisma.orderItem.findFirst({
      where: { productId: product.id, order: { buyerId: user.id, status: 'COMPLETED' } },
    });
    purchased = !!o;
  }
  const alreadyReviewed = user
    ? product.reviews.some((r) => r.userId === user.id)
    : false;

  return (
    <div className="container-custom py-12 md:py-16">
      <nav className="text-xs uppercase tracking-widest text-muted mb-8 font-semibold">
        <Link href="/products" className="link">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category.slug}`} className="link">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid md:grid-cols-12 gap-12">
        <div className="md:col-span-6">
          <div className="card overflow-hidden sticky top-24 aspect-[4/5]">
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
        </div>

        <div className="md:col-span-6">
          <span className="tag mb-4 inline-block">{product.type.toLowerCase()}</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            {product.title}
          </h1>
          <p className="mt-4 text-sm text-muted">
            By <span className="text-ink font-medium">{product.seller.name}</span>
            {' · '}
            <Link href={`/products?category=${product.category.slug}`} className="link">
              {product.category.name}
            </Link>
          </p>

          {avg !== null && (
            <p className="mt-3 text-sm">
              ★ {avg.toFixed(1)}{' '}
              <span className="text-muted">
                ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </p>
          )}

          <div className="mt-8 mb-8">
            <span className="text-5xl font-bold tracking-tight">
              {formatPrice(product.price.toString())}
            </span>
          </div>

          <p className="text-ink/80 leading-relaxed text-lg">{product.description}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <AddToCartButton productId={product.id} />
            {!user && (
              <Link href="/login" className="btn btn-ghost">
                Sign in to buy
              </Link>
            )}
          </div>

          <div className="mt-12 card p-6">
            <p className="label">About the seller</p>
            <p className="text-2xl font-bold tracking-tight mt-1">{product.seller.name}</p>
            {product.seller.bio && <p className="text-muted mt-2">{product.seller.bio}</p>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 pt-12 border-t border-black/[0.06]">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Reviews</h2>

        {user && purchased && !alreadyReviewed && (
          <div className="card p-6 mb-10">
            <p className="label">Leave a review</p>
            <ReviewForm productId={product.id} />
          </div>
        )}

        {product.reviews.length === 0 ? (
          <p className="text-muted">No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {product.reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-bold">{r.user.name}</p>
                  <span className="text-sm">★ {r.rating}/5</span>
                </div>
                <p className="text-ink/80 leading-relaxed">{r.comment}</p>
                <p className="text-xs font-mono text-muted mt-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
