import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/blob';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set BLOB_READ_WRITE_TOKEN in .env and restart.' },
      { status: 500 },
    );
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  if (user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Only sellers can upload images' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Image type "${file.type}" is not allowed.` },
      { status: 400 },
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: `Image is too large. Maximum is ${MAX_IMAGE_SIZE / 1024 / 1024} MB.` },
      { status: 400 },
    );
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('[upload/image] put() failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Upload to storage failed' },
      { status: 500 },
    );
  }
}
