import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ProductForm } from '@/components/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'SELLER') redirect('/');

  const categories = await prisma.category.findMany();

  return (
    <div className="container-custom py-12 md:py-16 max-w-2xl">
      <p className="label">List a new product</p>
      <h1 className="font-bold tracking-tight text-4xl md:text-5xl mb-8">New listing</h1>
      <p className="text-muted mb-8">
        Submissions are reviewed by an administrator before going live.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
