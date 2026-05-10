import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const schema = z.object({
  productIds: z.array(z.string()).min(1).max(50),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to check out' }, { status: 401 });
  if (user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Only buyers can place orders' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds }, status: 'APPROVED' },
  });
  if (products.length === 0) return NextResponse.json({ error: 'No valid products' }, { status: 400 });

  const total = products.reduce((s, p) => s + Number(p.price), 0);

  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      total,
      status: 'COMPLETED', // mock payment success for the coursework
      items: {
        create: products.map((p) => ({ productId: p.id, price: p.price })),
      },
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
