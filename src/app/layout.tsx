import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NavigationProgress } from '@/components/NavigationProgress';

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
      </body>
    </html>
  );
}
