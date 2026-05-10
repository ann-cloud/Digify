import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    include: { seller: true, category: true, reviews: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      {/* HERO */}
      <section className="container-custom pt-12 pb-12 md:pt-20 md:pb-16">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 rise">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              A new kind of digital marketplace
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
              Digital goods,
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(139, 92, 246) 100%)',
                }}
              >
                quietly made
              </span>
              .
            </h1>
            <p className="text-lg md:text-xl text-muted mt-6 leading-relaxed max-w-xl">
              A modern marketplace for e-books, software, music, and templates from
              independent makers. No algorithms, no dark patterns — just tools and
              texts worth keeping.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-accent">Browse the shop</Link>
              <Link href="/register" className="btn btn-ghost">Become a seller →</Link>
            </div>
          </div>
          <div className="md:col-span-5 rise" style={{ animationDelay: '120ms' }}>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="my-8 mx-3 md:mx-6">
        <div className="rounded-xl bg-ink text-white py-4 overflow-hidden">
          <div className="marquee whitespace-nowrap text-2xl md:text-3xl font-bold">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center gap-12 px-6">
                <span>E-books</span>
                <span className="text-accent">●</span>
                <span>Software</span>
                <span className="text-accent">●</span>
                <span>Music</span>
                <span className="text-accent">●</span>
                <span>Templates</span>
                <span className="text-accent">●</span>
                <span>Courses</span>
                <span className="text-accent">●</span>
                <span className="italic font-medium opacity-80">handmade goods</span>
                <span className="text-accent">●</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-custom py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label">Latest in the shop</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">New arrivals</h2>
          </div>
          <Link href="/products" className="btn btn-ghost text-sm">View all →</Link>
        </div>

        {featured.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted">No products yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="container-custom py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="label">By department</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Browse by kind
            </h2>
            <p className="mt-4 text-muted max-w-sm">
              From a 240-page book to a sound effect library, work is filed
              by kind so you can find what you need without scrolling.
            </p>
          </div>
          <ul className="md:col-span-8 space-y-2">
            {categories.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="card flex items-baseline justify-between p-5 group"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-accent transition-colors">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted">
                    {c._count.products} {c._count.products === 1 ? 'item' : 'items'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SELL CTA */}
      <section className="container-custom py-16 md:py-24">
        <div
          className="rounded-2xl p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center text-white relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgb(17, 17, 19) 0%, rgb(30, 27, 75) 60%, rgb(76, 29, 149) 100%)',
          }}
        >
          {/* decorative orbs */}
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-30 blur-3xl"
            style={{ background: 'rgb(139, 92, 246)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'rgb(99, 102, 241)' }}
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-2 mb-4 font-semibold">
              For makers
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Sell what you make.
            </h2>
            <p className="mt-4 text-white/70 max-w-md text-lg">
              Sign up as a seller, upload your product, and let it find its
              audience. We review every listing by hand.
            </p>
          </div>
          <div className="relative flex flex-col gap-3">
            <Link href="/register" className="btn btn-accent">
              Open a seller account
            </Link>
            <Link
              href="/products"
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(20px)',
              }}
            >
              Browse first
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-square max-w-md ml-auto">
      {/* Floating glass cards */}
      <div
        className="absolute top-0 left-8 w-44 card p-4 scale-in"
        style={{ animationDelay: '300ms', transform: 'rotate(-4deg)' }}
      >
        <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-amber-100 to-rose-200 mb-3" />
        <p className="text-xs font-semibold">Field Notes</p>
        <p className="text-[10px] text-muted">E-book · $12</p>
      </div>
      <div
        className="absolute top-12 right-0 w-44 card p-4 scale-in"
        style={{ animationDelay: '450ms', transform: 'rotate(5deg)' }}
      >
        <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-violet-200 to-indigo-300 mb-3" />
        <p className="text-xs font-semibold">Anvil Editor</p>
        <p className="text-[10px] text-muted">Software · $39</p>
      </div>
      <div
        className="absolute bottom-0 left-0 w-44 card p-4 scale-in"
        style={{ animationDelay: '600ms', transform: 'rotate(2deg)' }}
      >
        <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-emerald-100 to-teal-200 mb-3" />
        <p className="text-xs font-semibold">Slow Mornings</p>
        <p className="text-[10px] text-muted">Music · $8</p>
      </div>
      <div
        className="absolute bottom-12 right-8 w-44 card p-4 scale-in"
        style={{ animationDelay: '750ms', transform: 'rotate(-3deg)' }}
      >
        <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-sky-200 to-cyan-300 mb-3" />
        <p className="text-xs font-semibold">Bellows Icons</p>
        <p className="text-[10px] text-muted">Pack · $24</p>
      </div>
    </div>
  );
}
