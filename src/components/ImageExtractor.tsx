'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Download, 
  Globe, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Filter,
  Search,
  CheckSquare,
  Square,
  Eye
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import AdSpace from './AdSpace';
import ImageModal from './ImageModal';
import SidebarAds from './SidebarAds';

interface ImageData {
  src: string;
  alt: string;
  type: string;
  source?: string;
  attempt?: number;
  scrollPosition?: number;
}

interface DownloadedImage {
  url: string;
  data: string;
  filename: string;
  success: boolean;
  error?: string;
}

const translations = {
  ar: {
    urlLabel: 'رابط الموقع',
    urlPlaceholder: 'https://example.com',
    extractButton: 'استخراج الصور',
    searching: 'جاري البحث...',
    extractionMode: 'وضع الاستخراج:',
    basic: 'أساسي',
    basicDesc: 'سريع وبسيط',
    enhanced: 'محسن',
    enhancedDesc: 'مع انتظار تحميل الصور',
    advanced: 'متقدم',
    advancedDesc: 'للمواقع المعقدة',
    extractedImages: 'الصور المستخرجة',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء تحديد الكل',
    download: 'تحميل',
    downloading: 'جاري التحميل...',
    filterByType: 'تصفية حسب النوع:',
    noImages: 'لم يتم العثور على صور',
    noImagesDesc: 'جرب رابطاً آخر أو استخدم وضع استخراج مختلف',
    noDescription: 'بدون وصف',
    urlRequired: 'يرجى إدخال رابط الموقع',
    extractionFailed: 'فشل في استخراج الصور',
    downloadFailed: 'فشل في تحميل الصور',
    downloadSuccess: 'تم تحميل {count} صورة بنجاح',
    foundImages: 'تم العثور على {count} صورة بنجاح!',
    noImagesDownloaded: 'لم يتم تحميل أي صورة بنجاح'
  },
  en: {
    urlLabel: 'Website URL',
    urlPlaceholder: 'https://example.com',
    extractButton: 'Extract Images',
    searching: 'Searching...',
    extractionMode: 'Extraction Mode:',
    basic: 'Basic',
    basicDesc: 'Fast and simple',
    enhanced: 'Enhanced',
    enhancedDesc: 'With image loading wait',
    advanced: 'Advanced',
    advancedDesc: 'For complex websites',
    extractedImages: 'Extracted Images',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    download: 'Download',
    downloading: 'Downloading...',
    filterByType: 'Filter by type:',
    noImages: 'No images found',
    noImagesDesc: 'Try another URL or use a different extraction mode',
    noDescription: 'No description',
    urlRequired: 'Please enter a website URL',
    extractionFailed: 'Failed to extract images',
    downloadFailed: 'Failed to download images',
    downloadSuccess: '{count} images downloaded successfully',
    foundImages: 'Found {count} images successfully!',
    noImagesDownloaded: 'No images were downloaded successfully'
  },
  fr: {
    urlLabel: 'URL du site web',
    urlPlaceholder: 'https://example.com',
    extractButton: 'Extraire les images',
    searching: 'Recherche...',
    extractionMode: 'Mode d\'extraction:',
    basic: 'Basique',
    basicDesc: 'Rapide et simple',
    enhanced: 'Amélioré',
    enhancedDesc: 'Avec attente de chargement',
    advanced: 'Avancé',
    advancedDesc: 'Pour sites complexes',
    extractedImages: 'Images extraites',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    download: 'Télécharger',
    downloading: 'Téléchargement...',
    filterByType: 'Filtrer par type:',
    noImages: 'Aucune image trouvée',
    noImagesDesc: 'Essayez une autre URL ou un mode d\'extraction différent',
    noDescription: 'Aucune description',
    urlRequired: 'Veuillez entrer une URL de site web',
    extractionFailed: 'Échec de l\'extraction des images',
    downloadFailed: 'Échec du téléchargement des images',
    downloadSuccess: '{count} images téléchargées avec succès',
    foundImages: '{count} images trouvées avec succès!',
    noImagesDownloaded: 'Aucune image n\'a été téléchargée avec succès'
  }
};

interface ImageExtractorProps {
  defaultLanguage?: 'ar' | 'en' | 'fr';
}

export default function ImageExtractor({ defaultLanguage = 'ar' }: ImageExtractorProps = {}) {
  const [language, setLanguage] = useState<'ar' | 'en' | 'fr'>(defaultLanguage);
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [apiMode, setApiMode] = useState<'basic' | 'enhanced' | 'puppeteer'>('enhanced');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const t = translations[language];

  const extractImages = async () => {
    if (!url.trim()) {
      setError(t.urlRequired);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setImages([]);
    setSelectedImages([]);
    setSelectedTypes([]);
    setHasSearched(true);

    try {
      let apiEndpoint = '/api/extract-images';
      let requestBody: Record<string, string | number> = { url: url.trim() };
      
      switch (apiMode) {
        case 'enhanced':
          apiEndpoint = '/api/extract-images-enhanced';
          requestBody = { url: url.trim(), waitTime: 3000 };
          break;
        case 'puppeteer':
          apiEndpoint = '/api/extract-images-puppeteer';
          requestBody = { url: url.trim(), maxScrolls: 3, scrollDelay: 2000, waitAfterScroll: 1000 };
          break;
        default:
          apiEndpoint = '/api/extract-images';
          requestBody = { url: url.trim() };
      }
        
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.extractionFailed);
      }

      setImages(data.images);
      setSuccess(t.foundImages.replace('{count}', data.total.toString()));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t.extractionFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    if (selectedImages.includes(imageSrc)) {
      setSelectedImages(selectedImages.filter(src => src !== imageSrc));
    } else {
      setSelectedImages([...selectedImages, imageSrc]);
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  };

  const selectAllImages = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.src));
    }
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const downloadAsZip = async () => {
    if (selectedImages.length === 0) return;

    setDownloading(true);
    try {
      const response = await fetch('/api/download-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls: selectedImages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.downloadFailed);
      }

      const zip = new JSZip();
      let successCount = 0;

      data.images.forEach((img: DownloadedImage) => {
        if (img.success && img.data) {
          try {
            // Check if data is already a data URL or just base64
            let base64Data: string;
            if (img.data.startsWith('data:')) {
              // It's a data URL, extract the base64 part
              base64Data = img.data.split(',')[1];
            } else {
              // It's already base64
              base64Data = img.data;
            }
            
            zip.file(img.filename, base64Data, { base64: true });
            successCount++;
          } catch (error) {
            console.error(`Error adding ${img.filename} to zip:`, error);
          }
        }
      });

      if (successCount > 0) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const domain = new URL(url).hostname;
        saveAs(zipBlob, `images-${domain}-${Date.now()}.zip`);
        setSuccess(t.downloadSuccess.replace('{count}', successCount.toString()));
      } else {
        setError(t.noImagesDownloaded);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : t.downloadFailed);
    } finally {
      setDownloading(false);
    }
  };

  const filteredImages = selectedTypes.length > 0 
    ? images.filter(img => selectedTypes.includes(img.type))
    : images;

  const imageTypes = [...new Set(images.map(img => img.type))];

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* SEO-friendly structured content */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "مستخرج الصور - Image Extractor",
            "description": "استخرج جميع الصور من أي موقع ويب بسهولة وسرعة",
            "url": "https://your-domain.com",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "مستخرج الصور - Image Extractor",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          })
        }}
      />
      
      <Header language={language} onLanguageChange={setLanguage} />
      <SidebarAds language={language} side="left" />
      <SidebarAds language={language} side="right" />
      
      <Header language={language} onLanguageChange={setLanguage} />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Top Ad Space */}
          <AdSpace size="leaderboard" language={language} />

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* URL Input */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 mr-2" />
                {t.urlLabel}
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t.urlPlaceholder}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  disabled={loading}
                />
                <button
                  onClick={extractImages}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.searching}
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      {t.extractButton}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* API Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.extractionMode}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'basic', label: t.basic, desc: t.basicDesc },
                  { value: 'enhanced', label: t.enhanced, desc: t.enhancedDesc },
                  { value: 'puppeteer', label: t.advanced, desc: t.advancedDesc }
                ].map(mode => (
                  <label key={mode.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="apiMode"
                      value={mode.value}
                      checked={apiMode === mode.value}
                      onChange={(e) => setApiMode(e.target.value as 'basic' | 'enhanced' | 'puppeteer')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-colors ${
                      apiMode === mode.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900">{mode.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{mode.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Side Ad Space */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Image Filters and Controls */}
              {images.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t.extractedImages} ({filteredImages.length})
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={selectAllImages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {selectedImages.length === filteredImages.length ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        {selectedImages.length === filteredImages.length && filteredImages.length > 0 ? t.deselectAll : t.selectAll}
                      </button>
                      
                      <button
                        onClick={downloadAsZip}
                        disabled={downloading || selectedImages.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {downloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.downloading}
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            {t.download} ({selectedImages.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Type Filters */}
                  {imageTypes.length > 0 && (
                    <div className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Filter className="w-4 h-4 mr-2" />
                        {t.filterByType}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {imageTypes.map(type => (
                          <label key={type} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(type)}
                              onChange={(e) => handleTypeFilter(type, e.target.checked)}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-600 uppercase">
                              {type} ({images.filter(img => img.type === type).length})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Images Grid */}
              {filteredImages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image, index) => (
                      <div 
                        key={index} 
                        className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImages.includes(image.src)
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleImageClick(image.src)}
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        </div>
                        
                        {/* Selection Indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedImages.includes(image.src)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white bg-opacity-80 text-gray-600'
                          }`}>
                            {selectedImages.includes(image.src) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </div>
                        </div>

                        {/* View Image Button */}
                        <div className="absolute top-2 left-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(index);
                            }}
                            className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                            title={language === 'ar' ? 'عرض الصورة' : language === 'en' ? 'View Image' : 'Voir l\'image'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Image Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-xs truncate">{image.alt || t.noDescription}</div>
                          <div className="text-xs font-medium text-blue-300 uppercase">{image.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Images Message */}
              {!loading && hasSearched && images.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noImages}</h3>
                    <p className="text-gray-500">{t.noImagesDesc}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Ad */}
            <div className="lg:col-span-1">
              <AdSpace size="rectangle" language={language} />
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
      
      {/* Image Modal */}
      {filteredImages.length > 0 && (
        <ImageModal
          isOpen={modalOpen}
          onClose={closeImageModal}
          imageSrc={filteredImages[currentImageIndex]?.src || ''}
          imageAlt={filteredImages[currentImageIndex]?.alt || ''}
          imageType={filteredImages[currentImageIndex]?.type || ''}
          onPrevious={goToPreviousImage}
          onNext={goToNextImage}
          hasPrevious={filteredImages.length > 1}
          hasNext={filteredImages.length > 1}
          language={language}
        />
      )}
    </div>
  );
}
