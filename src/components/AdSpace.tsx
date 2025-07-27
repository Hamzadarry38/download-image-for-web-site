'use client';

interface AdSpaceProps {
  size: 'banner' | 'rectangle' | 'leaderboard';
  language: 'ar' | 'en' | 'fr';
}

const adSizes = {
  banner: { width: '320x50', class: 'h-12' },
  rectangle: { width: '300x250', class: 'h-64' },
  leaderboard: { width: '728x90', class: 'h-24' }
};

const translations = {
  ar: 'مساحة إعلانية',
  en: 'Advertisement Space',
  fr: 'Espace Publicitaire'
};

export default function AdSpace({ size, language }: AdSpaceProps) {
  const adSize = adSizes[size];
  const text = translations[language];

  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${adSize.class} my-4`}>
      <div className="text-gray-500 text-sm font-medium">{text}</div>
      <div className="text-gray-400 text-xs mt-1">{adSize.width}</div>
    </div>
  );
}
