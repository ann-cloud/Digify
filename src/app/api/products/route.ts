import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(100000),
  type: z.enum(['EBOOK', 'SOFTWARE', 'MUSIC', 'OTHER']),
  categoryId: z.string().min(1),
  fileUrl: z.string().url(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().nonnegative().optional(),
  fileMimeType: z.string().max(120).optional(),
  coverImage: z.string().url().nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  if (user.role !== 'SELLER') return NextResponse.json({ error: 'Only sellers can create products' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  // Build a unique slug
  let slug = slugify(parsed.data.title);
  let suffix = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${slugify(parsed.data.title)}-${suffix}`;
  }

  const product = await prisma.product.create({
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      type: parsed.data.type,
      categoryId: parsed.data.categoryId,
      fileUrl: parsed.data.fileUrl,
      fileName: parsed.data.fileName || null,
      fileSize: parsed.data.fileSize || null,
      fileMimeType: parsed.data.fileMimeType || null,
      coverImage: parsed.data.coverImage || null,
      sellerId: user.id,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ ok: true, id: product.id });
}
