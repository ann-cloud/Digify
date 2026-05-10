import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'BUYER') redirect('/');

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container-custom py-12 md:py-16 max-w-4xl">
      <p className="label">{user.name}</p>
      <h1 className="font-bold tracking-tight text-5xl md:text-6xl mb-10">My Library</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-black/[0.12]">
          <p className="text-2xl mb-2">Nothing here yet</p>
          <Link href="/products" className="link">Browse the shop →</Link>
        </div>
      ) : (
        <ul className="space-y-8">
          {orders.map((o) => (
            <li key={o.id} className="card p-6">
              <div className="flex justify-between items-baseline mb-4 pb-4 border-b border-black/[0.06]">
                <div>
                  <p className="font-mono text-xs text-muted uppercase tracking-widest">
                    Order #{o.id.slice(-8)}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-2xl">{formatPrice(o.total.toString())}</p>
              </div>
              <ul className="divide-y divide-black/[0.06]">
                {o.items.map((item) => (
                  <li key={item.id} className="py-3 flex justify-between items-center gap-4">
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-lg link"
                      >
                        {item.product.title}
                      </Link>
                      {item.product.fileName && (
                        <p className="text-xs text-muted font-mono mt-1">
                          {item.product.fileName}
                        </p>
                      )}
                    </div>
                    <a
                      href={`/api/download/${item.product.id}`}
                      className="btn text-xs"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
