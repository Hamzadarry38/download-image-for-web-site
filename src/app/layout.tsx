import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "مستخرج الصور المجاني - استخراج وتحميل الصور من أي موقع | Image Extractor",
    template: "%s | مستخرج الصور - Image Extractor"
  },
  description: "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة. يدعم العربية والإنجليزية والفرنسية. Free tool to extract and download all images from any website easily and quickly.",
  keywords: [
    // Arabic keywords
    "مستخرج الصور", "تحميل الصور", "استخراج الصور من المواقع", "تحميل الصور من الإنترنت",
    "أداة تحميل الصور", "استخراج الصور مجاناً", "تحميل صور المواقع", "أداة مجانية للصور",
    "تحميل الصور بالجملة", "استخراج صور الويب", "تحميل صور من أي موقع",
    // English keywords
    "image extractor", "download images", "extract images from website", "bulk image downloader",
    "free image extractor", "website image downloader", "image scraper", "download all images",
    "web image extractor", "image harvester", "batch image download", "extract website images",
    // French keywords
    "extracteur d'images", "télécharger images", "extraire images site web", "téléchargeur d'images",
    "outil gratuit images", "extraction images web", "téléchargement en masse", "récupérer images site"
  ],
  authors: [{ name: "Image Extractor Team" }],
  creator: "Image Extractor",
  publisher: "Image Extractor",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US', 'fr_FR'],
    title: "مستخرج الصور المجاني - استخراج وتحميل الصور من أي موقع",
    description: "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة. يدعم العربية والإنجليزية والفرنسية.",
    url: 'https://your-domain.com',
    siteName: 'مستخرج الصور - Image Extractor',
    images: [
      {
        url: 'https://your-domain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'مستخرج الصور - أداة مجانية لتحميل الصور من المواقع',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "مستخرج الصور المجاني - Image Extractor",
    description: "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب",
    images: ['https://your-domain.com/twitter-image.jpg'],
    creator: '@imageextractor',
  },
  alternates: {
    canonical: 'https://your-domain.com',
    languages: {
      'ar-SA': 'https://your-domain.com/ar',
      'en-US': 'https://your-domain.com/en',
      'fr-FR': 'https://your-domain.com/fr',
    },
  },
  category: 'technology',
  classification: 'Web Tools',
  other: {
    'google-site-verification': 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Enhanced SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        
        {/* Structured Data - JSON-LD */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "مستخرج الصور - Image Extractor",
              "description": "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة",
              "url": "https://your-domain.com",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "استخراج الصور من أي موقع ويب",
                "تحميل الصور بصيغة ZIP",
                "دعم متعدد اللغات",
                "واجهة سهلة الاستخدام",
                "مجاني بالكامل"
              ],
              "inLanguage": ["ar", "en", "fr"],
              "author": {
                "@type": "Organization",
                "name": "Image Extractor Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Image Extractor"
              }
            })
          }}
        />
        
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Google Analytics (replace with your GA4 ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
