import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://digify-dusky.vercel.app';

export default async function sitemap() {
  const products = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true, createdAt: true },
  });
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const staticPages = ['', '/products', '/categories', '/login', '/register'].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  const productPages = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${BASE_URL}/products?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}