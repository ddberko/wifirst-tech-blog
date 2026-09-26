import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import NewsletterConsent from '@/components/NewsletterConsent';
import LocaleProvider from '@/components/LocaleProvider';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Wifirst Tech Blog",
    template: "%s | Wifirst Tech Blog",
  },
  description:
    "Engineering insights, technical deep-dives, and innovations from the Wifirst team.",
  openGraph: {
    siteName: "Wifirst Tech Blog",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="fr" : le contenu est rédigé en français et LocaleProvider corrige
    // l'attribut côté client selon la langue choisie.
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
        style={{ fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif' }}
      >
        <LocaleProvider>
          <Header />
          <Suspense fallback={null}>
            <AnalyticsTracker />
            <NewsletterConsent />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
