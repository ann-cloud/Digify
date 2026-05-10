import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const cat = sp.category;
  const type = sp.type;
  const sort = sp.sort || 'new';

  const where: Prisma.ProductWhereInput = { status: 'APPROVED' };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (cat) where.category = { slug: cat };
  if (type && ['EBOOK', 'SOFTWARE', 'MUSIC', 'OTHER'].includes(type)) {
    where.type = type as any;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc' ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : { createdAt: 'desc' };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { seller: true, category: true, reviews: true },
      orderBy,
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="container-custom py-12 md:py-16">
      <div className="mb-10">
        <p className="label">The shop</p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">All products</h1>
      </div>

      {/* Filter card */}
      <form className="card p-5 md:p-6 mb-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5">
          <label className="label" htmlFor="q">Search</label>
          <input
            id="q" name="q" defaultValue={q}
            placeholder="Search title, description…"
            className="input"
          />
        </div>
        <div className="md:col-span-3">
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={cat || ''} className="input">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={type || ''} className="input">
            <option value="">All types</option>
            <option value="EBOOK">E-book</option>
            <option value="SOFTWARE">Software</option>
            <option value="MUSIC">Music</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="sort">Sort</label>
          <select id="sort" name="sort" defaultValue={sort} className="input">
            <option value="new">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
        <div className="md:col-span-12 flex gap-3 items-center">
          <button className="btn btn-accent">Apply filters</button>
          <Link href="/products" className="btn btn-ghost">Reset</Link>
          <span className="ml-auto text-sm text-muted">
            {products.length} {products.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-2xl font-bold mb-2">No products found</p>
          <p className="text-muted">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
