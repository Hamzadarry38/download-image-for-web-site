'use client';


interface HeaderProps {
  language: 'ar' | 'en' | 'fr';
  onLanguageChange: (lang: 'ar' | 'en' | 'fr') => void;
}

const translations = {
  ar: {
    title: 'مستخرج الصور',
    subtitle: 'استخرج جميع الصور من أي موقع ويب بسهولة وسرعة'
  },
  en: {
    title: 'Image Extractor',
    subtitle: 'Extract all images from any website easily and quickly'
  },
  fr: {
    title: 'Extracteur d\'Images',
    subtitle: 'Extrayez toutes les images de n\'importe quel site web facilement et rapidement'
  }
};

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const t = translations[language];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as 'ar' | 'en' | 'fr')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
