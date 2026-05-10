import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { status: 'APPROVED' } } } } },
  });

  return (
    <div className="container-custom py-12 md:py-16">
      <p className="label">Browse</p>
      <h1 className="font-bold tracking-tight text-5xl md:text-7xl mb-12">Categories</h1>

      <ul className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
        {categories.map((c, i) => (
          <li key={c.id}>
            <Link
              href={`/products?category=${c.slug}`}
              className="flex items-baseline justify-between py-8 hover:bg-surface-2 px-2 -mx-2 transition-colors group"
            >
              <div className="flex items-baseline gap-6">
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-3xl md:text-5xl group-hover:italic transition-all">
                  {c.name}
                </span>
              </div>
              <span className="text-sm text-muted">
                {c._count.products} {c._count.products === 1 ? 'item' : 'items'} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
