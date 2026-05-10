import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const schema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to post reviews' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  // Must have purchased
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { buyerId: user.id, status: 'COMPLETED' },
    },
  });
  if (!purchased) {
    return NextResponse.json({ error: 'You can only review products you have purchased' }, { status: 403 });
  }

  await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: user.id } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      productId: parsed.data.productId,
      userId: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  return NextResponse.json({ ok: true });
}
