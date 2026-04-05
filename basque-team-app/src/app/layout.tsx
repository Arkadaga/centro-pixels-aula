import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const geistSans = localFont({
  src: [
    { path: '../fonts/GeistVF.woff', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Basque Team — Kirolari Gunea',
  description:
    'Euskadiko kirol talentuen kudeaketa eta jarraipen plataforma digitala. Kirolarien profila, mediku hitzorduak, entrenamendua eta baliabideak.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="eu" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
