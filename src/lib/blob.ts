// Vercel Blob configuration
//
// Server-side uploads go through Vercel Functions, which cap request bodies
// at 4.5 MB on the Vercel platform. Local `npm run dev` has no such cap.
// We allow 50 MB here so local dev works comfortably; on Vercel itself,
// uploads larger than ~4.5 MB will fail with a 413 error.

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (effective limit ~4.5 MB on Vercel)
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB

// MIME types accepted for the digital good itself
export const ALLOWED_FILE_TYPES = [
  // Documents / e-books
  'application/pdf',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
  // Software / archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/ogg',
  'audio/mp4',
  // Generic / other
  'application/octet-stream',
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
