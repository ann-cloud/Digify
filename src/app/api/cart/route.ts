import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ ids: z.array(z.string()).max(50) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.ids }, status: 'APPROVED' },
    include: { seller: true },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price.toString(),
      coverImage: p.coverImage,
      seller: { name: p.seller.name },
    })),
  });
}
