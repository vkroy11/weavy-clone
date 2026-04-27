import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// metadataBase makes Next resolve the dynamic OG / Twitter image URLs to
// absolute https URLs in production. Override via NEXT_PUBLIC_SITE_URL on
// deploy; falls back to localhost for dev.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const description =
  'Drag nodes. Connect them. Run AI workflows. Build text + image pipelines on a visual canvas powered by Gemini and OpenAI.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Weavy — Visual AI Workflow Builder',
    template: '%s · Weavy',
  },
  description,
  applicationName: 'Weavy',
  authors: [{ name: 'Weavy' }],
  generator: 'Next.js',
  keywords: [
    'AI workflow',
    'visual programming',
    'image generation',
    'Gemini',
    'OpenAI',
    'Nano Banana',
    'Imagen',
    'GPT Image',
    'no-code AI',
    'ReactFlow',
    'node-based editor',
  ],
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Weavy',
    title: 'Weavy — Visual AI Workflow Builder',
    description,
    // images intentionally omitted — Next picks them up from
    // src/app/opengraph-image.tsx automatically.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weavy — Visual AI Workflow Builder',
    description,
    // images auto-resolved from src/app/twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Weavy',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
