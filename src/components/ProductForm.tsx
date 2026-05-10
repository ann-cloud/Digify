'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploader } from './FileUploader';
import { Spinner } from './Spinner';
import { MAX_FILE_SIZE, MAX_IMAGE_SIZE, ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPES } from '@/lib/blob';

type Category = { id: string; name: string };
type ProductData = {
  id: string;
  title: string;
  description: string;
  price: string;
  type: string;
  categoryId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  coverImage: string;
};

type FileInfo = { url: string; name: string; size: number; type: string };

export function ProductForm({
  categories, product,
}: { categories: Category[]; product?: ProductData }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!product;

  const [file, setFile] = useState<FileInfo>(
    product
      ? {
          url: product.fileUrl,
          name: product.fileName,
          size: product.fileSize,
          type: product.fileMimeType,
        }
      : { url: '', name: '', size: 0, type: '' },
  );
  const [coverImage, setCoverImage] = useState<string>(product?.coverImage || '');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!file.url) {
      setError('Please upload the product file before submitting.');
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get('title'),
      description: fd.get('description'),
      price: parseFloat(String(fd.get('price'))),
      type: fd.get('type'),
      categoryId: fd.get('categoryId'),
      fileUrl: file.url,
      fileName: file.name,
      fileSize: file.size,
      fileMimeType: file.type,
      coverImage: coverImage || null,
    };
    const res = await fetch(isEdit ? `/api/products/${product!.id}` : '/api/products', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setLoading(false);
      const j = await res.json();
      setError(j.error || 'Save failed');
      return;
    }
    router.push('/seller');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 md:p-8 space-y-6">
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" name="title" required defaultValue={product?.title} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description" name="description" required
          defaultValue={product?.description} className="input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="price">Price (USD)</label>
          <input
            id="price" name="price" type="number" step="0.01" min="0.01" required
            defaultValue={product?.price} className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={product?.type || 'EBOOK'} className="input">
            <option value="EBOOK">E-book</option>
            <option value="SOFTWARE">Software</option>
            <option value="MUSIC">Music</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId} className="input">
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <FileUploader
        label="Product file (the digital good buyers download)"
        uploadUrl="/api/upload/file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        maxBytes={MAX_FILE_SIZE}
        onUploaded={setFile}
        initialFileName={product?.fileName}
        initialUrl={product?.fileUrl}
      />

      <FileUploader
        label="Cover image (optional)"
        uploadUrl="/api/upload/image"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        maxBytes={MAX_IMAGE_SIZE}
        onUploaded={(info) => setCoverImage(info.url)}
        initialUrl={product?.coverImage || undefined}
        initialFileName={product?.coverImage ? 'cover image' : undefined}
        showImagePreview
      />

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button disabled={loading} className="btn btn-accent">
          {loading ? <><Spinner size="sm" /> Saving…</> : isEdit ? 'Save changes' : 'Submit for review'}
        </button>
      </div>
    </form>
  );
}
