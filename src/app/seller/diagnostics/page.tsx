import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Diagnostic page — visit /seller/diagnostics while signed in as a seller
// to verify your Blob configuration is working.
export default async function UploadDiagnosticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'SELLER') redirect('/');

  const tokenSet = !!process.env.BLOB_READ_WRITE_TOKEN;
  const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 20) || '(unset)';
  const tokenStartsCorrectly = process.env.BLOB_READ_WRITE_TOKEN?.startsWith('vercel_blob_rw_') || false;

  return (
    <div className="container-custom py-12 md:py-16 max-w-2xl">
      <p className="label">Seller diagnostics</p>
      <h1 className="font-bold tracking-tight text-4xl mb-8">Upload Configuration Check</h1>

      <div className="space-y-6">
        <Row
          label="Signed in as"
          value={`${user.name} (${user.email}) · role: ${user.role}`}
          ok={user.role === 'SELLER'}
        />
        <Row
          label="BLOB_READ_WRITE_TOKEN env var present"
          value={tokenSet ? 'yes' : 'no — add it to your .env file'}
          ok={tokenSet}
        />
        <Row
          label="Token has correct prefix"
          value={tokenStartsCorrectly ? `yes (${tokenPrefix}…)` : `no — got "${tokenPrefix}". Real tokens start with "vercel_blob_rw_"`}
          ok={tokenStartsCorrectly}
        />
        <Row
          label="App URL (NEXT_PUBLIC_VERCEL_URL)"
          value={process.env.VERCEL_URL || 'localhost (dev mode)'}
          ok={true}
        />
      </div>

      <div className="mt-10 p-5 border border-black/[0.08] bg-surface-2">
        <p className="label">If everything above is green but uploads still fail:</p>
        <ol className="list-decimal pl-5 mt-3 text-sm space-y-2 text-muted">
          <li>Restart the dev server (Ctrl+C, then <code className="bg-black/[0.08] px-1">npm run dev</code>) — Next.js only reads .env on startup.</li>
          <li>Verify you copied the <em>full</em> token. It should be ~80 characters long.</li>
          <li>In Vercel dashboard, open your Blob store and confirm the token there matches your .env exactly.</li>
          <li>Open the browser DevTools → Network tab, attempt an upload, click on the failed request to <code className="bg-black/[0.08] px-1">/api/upload/file</code>, and copy the JSON response. Share that error message — it will say exactly what went wrong server-side.</li>
        </ol>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="border-b border-black/[0.06] pb-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">{label}</p>
        <span className={ok ? 'text-green-700 font-mono text-xs' : 'text-red-700 font-mono text-xs'}>
          {ok ? '✓ OK' : '✗ FAIL'}
        </span>
      </div>
      <p className="text-sm text-muted font-mono mt-1 break-all">{value}</p>
    </div>
  );
}
