import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { DeleteProductButton } from '@/components/DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function SellerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'SELLER') redirect('/');

  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    include: { category: true, orderItems: true, reviews: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalSold = products.reduce((s, p) => s + p.orderItems.length, 0);
  const revenue = products.reduce(
    (s, p) => s + p.orderItems.reduce((a, oi) => a + Number(oi.price), 0),
    0,
  );
  const live = products.filter((p) => p.status === 'APPROVED').length;
  const pending = products.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="container-custom py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div>
          <p className="label">Seller dashboard</p>
          <h1 className="font-bold tracking-tight text-5xl md:text-6xl">{user.name}</h1>
        </div>
        <Link href="/seller/new" className="btn btn-accent">+ List a new product</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Stat label="Listings" value={products.length} />
        <Stat label="Live" value={live} />
        <Stat label="Pending" value={pending} />
        <Stat label="Sales" value={totalSold} />
        <div className="col-span-2 md:col-span-4 card p-6">
          <p className="label">Lifetime revenue</p>
          <p className="text-4xl mt-1 font-bold tracking-tight">{formatPrice(revenue)}</p>
        </div>
      </div>

      <h2 className="font-bold tracking-tight text-3xl mb-6">Your products</h2>
      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/[0.12]">
          <p className="text-2xl mb-2">No listings yet</p>
          <Link href="/seller/new" className="btn">List your first product</Link>
        </div>
      ) : (
        <div className="card divide-y divide-black/[0.06]">
          {products.map((p) => {
            const avg =
              p.reviews.length > 0
                ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                : null;
            return (
              <div key={p.id} className="py-5 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-5 flex gap-4 items-center">
                  <div className="w-16 h-20 bg-surface-2 shrink-0">
                    {p.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <Link href={`/products/${p.slug}`} className="text-lg link">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted">{p.category.name}</p>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <span
                    className={
                      'tag ' +
                      (p.status === 'APPROVED' ? 'tag-approved'
                        : p.status === 'PENDING' ? 'tag-pending'
                        : 'tag-rejected')
                    }
                  >
                    {p.status.toLowerCase()}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-2 text-sm">
                  <p>{formatPrice(p.price.toString())}</p>
                  <p className="text-xs text-muted">{p.orderItems.length} sold</p>
                </div>
                <div className="col-span-4 md:col-span-1 text-sm">
                  {avg !== null ? `★ ${avg.toFixed(1)}` : '—'}
                </div>
                <div className="col-span-12 md:col-span-2 flex gap-2 justify-end">
                  <Link href={`/seller/${p.id}/edit`} className="btn btn-ghost text-xs">Edit</Link>
                  <DeleteProductButton id={p.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-6">
      <p className="label">{label}</p>
      <p className="text-4xl mt-1 font-bold tracking-tight">{value}</p>
    </div>
  );
}
