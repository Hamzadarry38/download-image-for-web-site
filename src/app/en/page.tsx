import { Metadata } from 'next';
import ImageExtractor from '@/components/ImageExtractor';

export const metadata: Metadata = {
  title: "Free Image Extractor - Extract and Download Images from Any Website",
  description: "Free tool to extract and download all images from any website easily and quickly. Supports all image types and saves them in a single ZIP file.",
  keywords: [
    "image extractor", "download images", "extract images from website", "bulk image downloader",
    "free image extractor", "website image downloader", "image scraper", "download all images",
    "web image extractor", "image harvester", "batch image download", "extract website images",
    "image downloader tool", "website image scraper", "bulk image extractor", "free web tools",
    "download images without software", "online image extractor", "web image downloader"
  ],
  alternates: {
    canonical: 'https://your-domain.com/en',
    languages: {
      'ar-SA': 'https://your-domain.com/ar',
      'en-US': 'https://your-domain.com/en',
      'fr-FR': 'https://your-domain.com/fr',
      'x-default': 'https://your-domain.com'
    }
  },
  openGraph: {
    title: "Free Image Extractor - Extract and Download Images from Any Website",
    description: "Free tool to extract and download all images from any website easily and quickly",
    url: 'https://your-domain.com/en',
    locale: 'en_US',
    alternateLocale: ['ar_SA', 'fr_FR'],
  },
  twitter: {
    title: "Free Image Extractor",
    description: "Free tool to extract and download all images from any website",
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
  }
};

export default function EnglishPage() {
  return (
    <div lang="en" dir="ltr">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Free Image Extractor",
            "description": "Free tool to extract and download all images from any website easily and quickly",
            "url": "https://your-domain.com/en",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Image Extractor",
              "url": "https://your-domain.com"
            },
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Image Extractor",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Extract images from any website",
                "Download images as ZIP file",
                "Support all image types",
                "Easy to use interface",
                "Completely free"
              ]
            }
          })
        }}
      />
      <ImageExtractor defaultLanguage="en" />
    </div>
  );
}
