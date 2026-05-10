'use client';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';
  return <span className={`spinner ${sizeClass} ${className}`} aria-label="Loading" />;
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 fade-in">
        <Spinner size="lg" className="text-accent" />
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-muted">
      <Spinner />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}
