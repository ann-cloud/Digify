import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { AdminProductsClient } from '@/components/AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/');

  const sp = await searchParams;
  const status = sp.status;

  const products = await prisma.product.findMany({
    where: status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)
      ? { status: status as any }
      : {},
    include: {
      seller: { select: { id: true, name: true, email: true, bio: true } },
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize for the client component
  const serialized = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    price: p.price.toString(),
    type: p.type,
    status: p.status,
    coverImage: p.coverImage,
    fileUrl: p.fileUrl,
    fileName: p.fileName,
    fileSize: p.fileSize,
    fileMimeType: p.fileMimeType,
    createdAt: p.createdAt.toISOString(),
    seller: p.seller,
    category: p.category,
    reviews: p.reviews,
  }));

  return <AdminProductsClient products={serialized} currentStatus={status} />;
}
