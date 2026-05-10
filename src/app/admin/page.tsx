import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/');

  const [
    productsTotal,
    pendingCount,
    usersTotal,
    sellersCount,
    buyersCount,
    ordersCount,
    revenueAgg,
    recentOrders,
    recentPending,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: 'PENDING' } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'COMPLETED' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { buyer: true, items: true },
    }),
    prisma.product.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { seller: true },
    }),
  ]);

  return (
    <div className="container-custom py-12 md:py-16">
      <div className="mb-12">
        <p className="label">Administrator</p>
        <h1 className="font-bold tracking-tight text-5xl md:text-6xl">Dashboard</h1>
      </div>

      <nav className="flex flex-wrap gap-4 mb-12 text-sm">
        <Link href="/admin" className="link">Overview</Link>
        <Link href="/admin/products" className="link">Products ({pendingCount} pending)</Link>
        <Link href="/admin/users" className="link">Users</Link>
        <Link href="/admin/orders" className="link">Orders</Link>
      </nav>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Stat label="Users" value={usersTotal} />
        <Stat label="Sellers" value={sellersCount} />
        <Stat label="Buyers" value={buyersCount} />
        <Stat label="Products" value={productsTotal} />
        <Stat label="Pending review" value={pendingCount} accent />
        <Stat label="Orders" value={ordersCount} />
        <div className="col-span-2 card p-6">
          <p className="label">Total revenue</p>
          <p className="text-4xl mt-1 font-bold tracking-tight">
            {formatPrice(Number(revenueAgg._sum.total ?? 0))}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-bold tracking-tight text-2xl mb-4">Pending review</h2>
          {recentPending.length === 0 ? (
            <p className="text-muted text-sm">All caught up.</p>
          ) : (
            <ul className="card divide-y divide-black/[0.06] overflow-hidden">
              {recentPending.map((p) => (
                <li key={p.id} className="px-5 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted">by {p.seller.name}</p>
                  </div>
                  <Link href="/admin/products" className="text-sm link">Review →</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-bold tracking-tight text-2xl mb-4">Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">No orders yet.</p>
          ) : (
            <ul className="card divide-y divide-black/[0.06] overflow-hidden">
              {recentOrders.map((o) => (
                <li key={o.id} className="px-5 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{o.buyer.name}</p>
                    <p className="text-xs text-muted">
                      {o.items.length} items · {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-mono text-sm">{formatPrice(o.total.toString())}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`card p-6 ${accent && value > 0 ? 'bg-accent/10 border-accent' : ''}`}>
      <p className="label">{label}</p>
      <p className="text-4xl mt-1 font-bold tracking-tight">{value}</p>
    </div>
  );
}
