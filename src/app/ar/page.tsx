import { Metadata } from 'next';
import ImageExtractor from '@/components/ImageExtractor';

export const metadata: Metadata = {
  title: "مستخرج الصور المجاني - استخراج وتحميل الصور من أي موقع ويب",
  description: "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة. يدعم جميع أنواع الصور ويحفظها في ملف ZIP واحد.",
  keywords: [
    "مستخرج الصور", "تحميل الصور", "استخراج الصور من المواقع", "تحميل الصور من الإنترنت",
    "أداة تحميل الصور", "استخراج الصور مجاناً", "تحميل صور المواقع", "أداة مجانية للصور",
    "تحميل الصور بالجملة", "استخراج صور الويب", "تحميل صور من أي موقع", "برنامج تحميل الصور",
    "موقع تحميل الصور", "تطبيق استخراج الصور", "أدوات الويب المجانية", "تحميل صور بدون برامج"
  ],
  alternates: {
    canonical: 'https://your-domain.com/ar',
    languages: {
      'ar-SA': 'https://your-domain.com/ar',
      'en-US': 'https://your-domain.com/en',
      'fr-FR': 'https://your-domain.com/fr',
      'x-default': 'https://your-domain.com'
    }
  },
  openGraph: {
    title: "مستخرج الصور المجاني - استخراج وتحميل الصور من أي موقع ويب",
    description: "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة",
    url: 'https://your-domain.com/ar',
    locale: 'ar_SA',
    alternateLocale: ['en_US', 'fr_FR'],
  },
  twitter: {
    title: "مستخرج الصور المجاني",
    description: "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب",
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
  }
};

export default function ArabicPage() {
  return (
    <div lang="ar" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "مستخرج الصور المجاني",
            "description": "أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة",
            "url": "https://your-domain.com/ar",
            "inLanguage": "ar-SA",
            "isPartOf": {
              "@type": "WebSite",
              "name": "مستخرج الصور",
              "url": "https://your-domain.com"
            },
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "مستخرج الصور",
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
                "دعم جميع أنواع الصور",
                "واجهة سهلة الاستخدام",
                "مجاني بالكامل"
              ]
            }
          })
        }}
      />
      <ImageExtractor defaultLanguage="ar" />
    </div>
  );
}
