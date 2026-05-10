import { NextResponse } from 'next/server';
import { z } from 'zod';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.number().positive().max(100000).optional(),
  type: z.enum(['EBOOK', 'SOFTWARE', 'MUSIC', 'OTHER']).optional(),
  categoryId: z.string().min(1).optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().nonnegative().optional(),
  fileMimeType: z.string().max(120).optional(),
  coverImage: z.string().url().nullable().optional(),
});

// Best-effort: deletes a Vercel Blob if a token is configured.
// Doesn't throw on failure (e.g. local dev without Blob set up).
async function tryDeleteBlob(url?: string | null) {
  if (!url) return;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch (err) {
    console.warn('Failed to delete blob', url, err);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Sellers edit their own listings; admins edit anyone's
  if (product.sellerId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  // If file or cover was replaced, delete the old blob
  if (parsed.data.fileUrl && parsed.data.fileUrl !== product.fileUrl) {
    await tryDeleteBlob(product.fileUrl);
  }
  if (
    parsed.data.coverImage !== undefined &&
    parsed.data.coverImage !== product.coverImage
  ) {
    await tryDeleteBlob(product.coverImage);
  }

  // Seller edits send the listing back to PENDING
  const data: any = { ...parsed.data };
  if (user.role === 'SELLER') data.status = 'PENDING';

  const updated = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ ok: true, id: updated.id });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (product.sellerId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Clean up blobs first; don't fail the delete if cleanup fails
  await tryDeleteBlob(product.fileUrl);
  await tryDeleteBlob(product.coverImage);

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
