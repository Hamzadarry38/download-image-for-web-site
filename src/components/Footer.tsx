'use client';

interface FooterProps {
  language: 'ar' | 'en' | 'fr';
}

const translations = {
  ar: {
    rights: 'جميع الحقوق محفوظة',
    year: '2024',
    company: 'مستخرج الصور'
  },
  en: {
    rights: 'All rights reserved',
    year: '2024',
    company: 'Image Extractor'
  },
  fr: {
    rights: 'Tous droits réservés',
    year: '2024',
    company: 'Extracteur d\'Images'
  }
};

export default function Footer({ language }: FooterProps) {
  const t = translations[language];

  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Ad Space */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-500 text-sm mb-2">
              {language === 'ar' ? 'مساحة إعلانية' : language === 'en' ? 'Advertisement Space' : 'Espace Publicitaire'}
            </div>
            <div className="text-gray-400 text-xs">728 x 90</div>
          </div>
        </div>
        
        <div className="text-center text-gray-600 text-sm">
          <p>© {t.year} {t.company}. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
