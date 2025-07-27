import { Metadata } from 'next';
import ImageExtractor from '@/components/ImageExtractor';

export const metadata: Metadata = {
  title: "Extracteur d'Images Gratuit - Extraire et Télécharger des Images de N'importe Quel Site Web",
  description: "Outil gratuit pour extraire et télécharger toutes les images de n'importe quel site web facilement et rapidement. Prend en charge tous les types d'images et les enregistre dans un seul fichier ZIP.",
  keywords: [
    "extracteur d'images", "télécharger images", "extraire images site web", "téléchargeur d'images",
    "outil gratuit images", "extraction images web", "téléchargement en masse", "récupérer images site",
    "extracteur images gratuit", "téléchargeur images web", "outil extraction images", "télécharger images gratuitement",
    "extracteur images en ligne", "téléchargement images bulk", "outil web gratuit", "télécharger images sans logiciel"
  ],
  alternates: {
    canonical: 'https://your-domain.com/fr',
    languages: {
      'ar-SA': 'https://your-domain.com/ar',
      'en-US': 'https://your-domain.com/en',
      'fr-FR': 'https://your-domain.com/fr',
      'x-default': 'https://your-domain.com'
    }
  },
  openGraph: {
    title: "Extracteur d'Images Gratuit - Extraire et Télécharger des Images de N'importe Quel Site Web",
    description: "Outil gratuit pour extraire et télécharger toutes les images de n'importe quel site web facilement et rapidement",
    url: 'https://your-domain.com/fr',
    locale: 'fr_FR',
    alternateLocale: ['ar_SA', 'en_US'],
  },
  twitter: {
    title: "Extracteur d'Images Gratuit",
    description: "Outil gratuit pour extraire et télécharger toutes les images de n'importe quel site web",
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
  }
};

export default function FrenchPage() {
  return (
    <div lang="fr" dir="ltr">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Extracteur d'Images Gratuit",
            "description": "Outil gratuit pour extraire et télécharger toutes les images de n'importe quel site web facilement et rapidement",
            "url": "https://your-domain.com/fr",
            "inLanguage": "fr-FR",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Extracteur d'Images",
              "url": "https://your-domain.com"
            },
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Extracteur d'Images",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Extraire des images de n'importe quel site web",
                "Télécharger les images en fichier ZIP",
                "Support de tous les types d'images",
                "Interface facile à utiliser",
                "Complètement gratuit"
              ]
            }
          })
        }}
      />
      <ImageExtractor defaultLanguage="fr" />
    </div>
  );
}
