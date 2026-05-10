'use client';
import { useRef, useState } from 'react';
import { formatBytes } from '@/lib/blob';

type Props = {
  /** Endpoint that receives the file and returns { url, name, size, type } */
  uploadUrl: string;
  /** Comma-separated MIME types or extensions for the <input accept> attribute */
  accept: string;
  /** Display only — server enforces the real limit */
  maxBytes: number;
  /** Called when an upload completes successfully */
  onUploaded: (info: { url: string; name: string; size: number; type: string }) => void;
  /** Initial filename to display (when editing an existing product) */
  initialFileName?: string;
  /** Initial URL (so we can show the existing cover image as a preview) */
  initialUrl?: string;
  /** Show a small image preview thumbnail (for cover images) */
  showImagePreview?: boolean;
  /** Visible label */
  label: string;
  /** Required hidden input */
  required?: boolean;
};

export function FileUploader({
  uploadUrl,
  accept,
  maxBytes,
  onUploaded,
  initialFileName,
  initialUrl,
  showImagePreview,
  label,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ name: string; size: number; url: string } | null>(
    initialFileName && initialUrl
      ? { name: initialFileName, size: 0, url: initialUrl }
      : null,
  );

  function uploadWithProgress(file: File): Promise<{ url: string; name: string; size: number; type: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append('file', file);

      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        let body: any = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          // not JSON
        }
        if (xhr.status >= 200 && xhr.status < 300 && body?.url) {
          resolve(body);
        } else {
          reject(new Error(body?.error || `Upload failed (HTTP ${xhr.status})`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('POST', uploadUrl);
      xhr.send(fd);
    });
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    if (file.size > maxBytes) {
      setError(`File is too large. Maximum is ${formatBytes(maxBytes)}.`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadWithProgress(file);
      setDone({ name: result.name, size: result.size, url: result.url });
      onUploaded(result);
    } catch (err) {
      setError((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setDone(null);
    setError('');
    setProgress(0);
    onUploaded({ url: '', name: '', size: 0, type: '' });
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label className="label">{label}</label>

      {!done ? (
        <div className="border border-dashed border-black/[0.14] p-6 text-center">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onPick}
            disabled={uploading}
            className="hidden"
            id={`file-${label.replace(/\s+/g, '-')}`}
            required={required}
          />
          <label
            htmlFor={`file-${label.replace(/\s+/g, '-')}`}
            className={`btn ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
          >
            {uploading ? `Uploading… ${progress}%` : 'Choose a file'}
          </label>
          <p className="text-xs text-muted mt-3">
            Up to {formatBytes(maxBytes)}
          </p>
          {uploading && (
            <div className="mt-4 h-1 bg-black/[0.08] overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="border border-black/[0.08] p-4 flex items-center gap-4">
          {showImagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={done.url}
              alt=""
              className="w-16 h-16 object-cover bg-surface-2"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{done.name}</p>
            {done.size > 0 && (
              <p className="text-xs text-muted">{formatBytes(done.size)}</p>
            )}
            <p className="text-xs font-mono text-muted truncate">{done.url}</p>
          </div>
          <button type="button" onClick={reset} className="btn btn-ghost text-xs">
            Replace
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
