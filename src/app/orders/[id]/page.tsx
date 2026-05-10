import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrderPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();
  if (order.buyerId !== user.id && user.role !== 'ADMIN') notFound();

  return (
    <div className="container-custom py-12 md:py-16 max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-4">
        Order placed
      </p>
      <h1 className="font-bold tracking-tight text-5xl md:text-6xl mb-3">Thank you.</h1>
      <p className="text-muted text-lg mb-10">
        Your order is complete. Files are ready to download below.
      </p>

      <div className="card p-6 md:p-8">
        <div className="flex justify-between mb-6 pb-6 border-b border-black/[0.06]">
          <div>
            <p className="label">Order number</p>
            <p className="font-mono">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="label">Total</p>
            <p className="text-2xl">{formatPrice(order.total.toString())}</p>
          </div>
        </div>

        <ul className="divide-y divide-black/[0.06]">
          {order.items.map((item) => (
            <li key={item.id} className="py-4 flex justify-between items-center gap-4">
              <div>
                <Link href={`/products/${item.product.slug}`} className="text-xl link">
                  {item.product.title}
                </Link>
                <p className="text-sm text-muted mt-1">
                  {formatPrice(item.price.toString())}
                  {item.product.fileName && (
                    <span className="ml-2 font-mono text-xs text-muted">
                      · {item.product.fileName}
                    </span>
                  )}
                </p>
              </div>
              <a
                href={`/api/download/${item.product.id}`}
                className="btn"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/orders" className="btn btn-ghost">View all orders</Link>
        <Link href="/products" className="btn">Continue shopping</Link>
      </div>
    </div>
  );
}
