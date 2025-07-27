'use client';

interface SidebarAdsProps {
  language: 'ar' | 'en' | 'fr';
  side: 'left' | 'right';
}

const translations = {
  ar: 'مساحة إعلانية',
  en: 'Advertisement Space',
  fr: 'Espace Publicitaire'
};

export default function SidebarAds({ language, side }: SidebarAdsProps) {
  const text = translations[language];

  return (
    <div className={`fixed ${side === 'left' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 z-10 hidden xl:block`}>
      <div className="w-36 space-y-6">
        {/* Vertical Banner Ad 1 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-80 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="text-gray-600 text-sm font-medium text-center mb-2">{text}</div>
          <div className="text-gray-400 text-xs">160x600</div>
          <div className="mt-2 w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
            <div className="text-gray-500 text-xs">Ad Content</div>
          </div>
        </div>
        
        {/* Vertical Banner Ad 2 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-80 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="text-gray-600 text-sm font-medium text-center mb-2">{text}</div>
          <div className="text-gray-400 text-xs">160x600</div>
          <div className="mt-2 w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded flex items-center justify-center">
            <div className="text-gray-500 text-xs">Ad Content</div>
          </div>
        </div>
        
        {/* Square Ad */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 h-40 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="text-gray-600 text-xs font-medium text-center mb-2">{text}</div>
          <div className="text-gray-400 text-xs">160x160</div>
          <div className="mt-2 w-full h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded flex items-center justify-center">
            <div className="text-gray-500 text-xs">Ad</div>
          </div>
        </div>
      </div>
    </div>
  );
}
