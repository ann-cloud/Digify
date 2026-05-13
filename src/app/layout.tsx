import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NavigationProgress } from '@/components/NavigationProgress';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Digify — Digital Marketplace for Independent Makers',
  description:
    'Buy and sell digital goods — e-books, software, music, and templates — from independent makers. Curated, reviewed, and built with care.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#f7f8fa',
  verification: {
    google: '-NEwK-lGa2dUjhrcynQFhc2Lx1nleAGI5nz7D0kApm8',
      other: {
      'msvalidate.01': '3A594C7399ECEAB7337270F9677E2ADC',
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <NavigationProgress />
        <Header
          user={
            user
              ? { id: user.id, name: user.name, role: user.role, email: user.email }
              : null
          }
        />
        <main>{children}</main>
        <Footer />
        <GoogleAnalytics gaId="G-4S0QD92NXR" />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wp2pj68ewz");`}
        </Script>
          <Script
            src="https://plausible.io/js/pa-UIODoaVapPpYeaOoIV6NU.js"
            strategy="afterInteractive"
          />
          <Script id="plausible-init" strategy="afterInteractive">
            {`
              window.plausible = window.plausible || function() { (plausible.q = plausible.q || []).push(arguments) };
              plausible.init = plausible.init || function(i) { plausible.o = i || {} };
              plausible.init();
            `}
          </Script>
        <Analytics />
      </body>
    </html>
  );
}
