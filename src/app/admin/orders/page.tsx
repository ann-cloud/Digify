import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/');

  const orders = await prisma.order.findMany({
    include: { buyer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container-custom py-12 md:py-16">
      <p className="label">Admin</p>
      <h1 className="font-bold tracking-tight text-5xl md:text-6xl mb-8">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="card divide-y divide-black/[0.06]">
          {orders.map((o) => (
            <div key={o.id} className="px-5 py-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">
                <p className="font-mono text-xs text-muted uppercase tracking-widest">
                  #{o.id.slice(-8)}
                </p>
                <p className="text-xs text-muted mt-1">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="col-span-6 md:col-span-3">
                <p className="font-medium">{o.buyer.name}</p>
                <p className="text-xs text-muted">{o.buyer.email}</p>
              </div>
              <div className="col-span-6 md:col-span-3 text-sm">
                {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                <ul className="text-xs text-muted mt-1">
                  {o.items.slice(0, 2).map((it) => (
                    <li key={it.id}>· {it.product.title}</li>
                  ))}
                  {o.items.length > 2 && <li>· +{o.items.length - 2} more</li>}
                </ul>
              </div>
              <div className="col-span-6 md:col-span-2 text-lg">
                {formatPrice(o.total.toString())}
              </div>
              <div className="col-span-6 md:col-span-1 text-right">
                <Link href={`/orders/${o.id}`} className="text-sm link">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
