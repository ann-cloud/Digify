import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Streams the product file to the buyer, verifying ownership first.
// Sellers can also download their own files; admins can download anything.
//
// We fetch the bytes server-side and pipe them to the client (rather than
// 302-redirecting to the Blob URL). This is slightly heavier but means
// the bare Blob URL is never exposed in the browser, so a buyer can't
// share a permanent direct-download link with a non-buyer.

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Authorization
  const isAdmin = user.role === 'ADMIN';
  const isOwner = user.id === product.sellerId;
  let hasPurchased = false;
  if (!isAdmin && !isOwner) {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: { buyerId: user.id, status: 'COMPLETED' },
      },
    });
    hasPurchased = !!orderItem;
  }
  if (!isAdmin && !isOwner && !hasPurchased) {
    return NextResponse.json(
      { error: 'You must purchase this product to download it' },
      { status: 403 },
    );
  }

  // Pull bytes from the Blob URL and stream them back
  try {
    const blobResponse = await fetch(product.fileUrl);
    if (!blobResponse.ok || !blobResponse.body) {
      return NextResponse.json({ error: 'File unavailable' }, { status: 502 });
    }

    const downloadName = product.fileName || `${product.slug}`;
    return new Response(blobResponse.body, {
      status: 200,
      headers: {
        'Content-Type': product.fileMimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadName)}"`,
        'Cache-Control': 'private, no-store',
        ...(product.fileSize ? { 'Content-Length': String(product.fileSize) } : {}),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
