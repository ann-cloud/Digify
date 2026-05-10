import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ProductForm } from '@/components/ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'SELLER') redirect('/');

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.sellerId !== user.id) notFound();

  const categories = await prisma.category.findMany();

  return (
    <div className="container-custom py-12 md:py-16 max-w-2xl">
      <p className="label">Edit listing</p>
      <h1 className="font-bold tracking-tight text-4xl md:text-5xl mb-8">{product.title}</h1>
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price.toString(),
          type: product.type,
          categoryId: product.categoryId,
          fileUrl: product.fileUrl,
          fileName: product.fileName || '',
          fileSize: product.fileSize || 0,
          fileMimeType: product.fileMimeType || '',
          coverImage: product.coverImage || '',
        }}
      />
    </div>
  );
}
