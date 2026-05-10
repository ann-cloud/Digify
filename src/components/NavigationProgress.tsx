'use client';
import { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';

// A thin progress bar at the very top of the page that animates while
// a route is being prepared. It listens for clicks on internal links and
// shows the bar until the path actually changes (or a timeout).
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname changes, finish the bar and hide.
  useEffect(() => {
    if (active) {
      setProgress(100);
      const t = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show the bar on internal-link clicks and form submits to known routes.
  useEffect(() => {
    function isInternalAnchor(el: HTMLAnchorElement | null) {
      if (!el) return false;
      if (el.target && el.target !== '' && el.target !== '_self') return false;
      if (el.hasAttribute('download')) return false;
      const href = el.getAttribute('href');
      if (!href) return false;
      if (href.startsWith('#')) return false;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      try {
        const url = new URL(el.href, window.location.href);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    }

    function onClick(e: MouseEvent) {
      // Only respond to plain left-clicks (no modifier keys → real navigation)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      if (!isInternalAnchor(target)) return;
      // Skip if it's the current path
      try {
        const url = new URL(target!.href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
      } catch {}
      start();
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Smoothly creep the progress while waiting
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const inc = (90 - p) * 0.06;
        return Math.min(90, p + inc);
      });
    }, 100);
    return () => clearInterval(id);
  }, [active]);

  function start() {
    setActive(true);
    setProgress(8);
  }

  if (!active && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[300] pointer-events-none"
      style={{ height: 2 }}
    >
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-2"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 200ms ease' : 'width 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
        }}
      />
    </div>
  );
}

// Helper hook for in-component "is this transitioning" state
export function useNavTransition() {
  return useTransition();
}
