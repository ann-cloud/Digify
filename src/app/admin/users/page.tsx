import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { UserRowActions } from '@/components/UserRowActions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true, orders: true } } },
  });

  return (
    <div className="container-custom py-12 md:py-16">
      <p className="label">Admin</p>
      <h1 className="font-bold tracking-tight text-5xl md:text-6xl mb-8">Users</h1>

      <div className="card divide-y divide-black/[0.06]">
        {users.map((u) => (
          <div key={u.id} className="px-5 py-4 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-4">
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-muted">{u.email}</p>
            </div>
            <div className="col-span-3 md:col-span-2">
              <span className="tag">{u.role.toLowerCase()}</span>
            </div>
            <div className="col-span-4 md:col-span-3 text-xs text-muted">
              {u._count.products} products · {u._count.orders} orders
            </div>
            <div className="col-span-2 md:col-span-1">
              {u.blocked && <span className="tag tag-rejected">blocked</span>}
            </div>
            <div className="col-span-12 md:col-span-2 flex justify-end">
              {u.id !== user.id && (
                <UserRowActions id={u.id} blocked={u.blocked} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
