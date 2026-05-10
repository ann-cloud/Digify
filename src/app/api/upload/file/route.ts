import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/blob';

// Server-side upload: the browser sends the file to this route, the route
// uploads it to Vercel Blob, and returns the resulting URL.
//
// Body limit: Vercel Functions cap request bodies at 4.5 MB in production.
// Local dev has no such cap, so the same code happily handles 50 MB files
// when running `npm run dev`.

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[upload/file] BLOB_READ_WRITE_TOKEN is not set');
    return NextResponse.json(
      { error: 'File storage is not configured. Set BLOB_READ_WRITE_TOKEN in .env and restart.' },
      { status: 500 },
    );
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  if (user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Only sellers can upload files' }, { status: 403 });
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

  // Validate type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `File type "${file.type}" is not allowed.` },
      { status: 400 },
    );
  }

  // Validate size (the platform body limit will fail earlier on Vercel,
  // but in dev we want a clean error message).
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File is too large. Maximum is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 });
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
    console.error('[upload/file] put() failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Upload to storage failed' },
      { status: 500 },
    );
  }
}
