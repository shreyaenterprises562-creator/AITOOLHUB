import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { brandConfig } from '../config/brand.config';
import { AppProviders } from '../components/providers/AppProviders';

export const metadata: Metadata = {
  title: '12RUSH - Cleaning Essentials Delivered Locally',
  description:
    'Local quick-commerce marketplace for cleaning and home-care essentials within our 15 KM service area.',
  openGraph: {
    title: '12RUSH - Cleaning Essentials Delivered Locally',
    description:
      'Local quick-commerce marketplace for cleaning and home-care essentials within our 15 KM service area.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
