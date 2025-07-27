'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Download, 
  Globe, 
  Image as ImageIcon, 
  Settings, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Filter,
  Grid3X3,
  Eye,
  Search,
  Sparkles
} from 'lucide-react';

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

export default function ImageExtractor() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [waitTime, setWaitTime] = useState(5000);
  const [scrollAttempts, setScrollAttempts] = useState(3);
  const [waitBetweenScrolls, setWaitBetweenScrolls] = useState(2000);
  const [maxScrolls, setMaxScrolls] = useState(5);
  const [scrollDelay, setScrollDelay] = useState(2000);
  const [apiMode, setApiMode] = useState<'basic' | 'enhanced' | 'scroll' | 'puppeteer'>('puppeteer');

  const extractImages = async () => {
    if (!url.trim()) {
      setError('يرجى إدخال رابط الموقع');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setImages([]);
    setSelectedImages([]);
    setSelectedTypes([]);

    try {
      let apiEndpoint = '/api/extract-images';
      let requestBody: Record<string, any> = { url: url.trim() };
      
      switch (apiMode) {
        case 'enhanced':
          apiEndpoint = '/api/extract-images-enhanced';
          requestBody = { url: url.trim(), waitTime };
          break;
        case 'scroll':
          apiEndpoint = '/api/extract-images-scroll';
          requestBody = { url: url.trim(), scrollAttempts, waitBetweenScrolls };
          break;
        case 'puppeteer':
          apiEndpoint = '/api/extract-images-puppeteer';
          requestBody = { url: url.trim(), maxScrolls, scrollDelay, waitAfterScroll: 1000 };
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
        throw new Error(data.error || 'فشل في استخراج الصور');
      }

      setImages(data.images);
      
      // Show detailed success message
      const typeCount = data.images.reduce((acc: Record<string, number>, img: ImageData) => {
        acc[img.type] = (acc[img.type] || 0) + 1;
        return acc;
      }, {});
      
      const typeInfo = Object.entries(typeCount)
        .map(([type, count]) => `${type.toUpperCase()}: ${count}`)
        .join(', ');
      
      let successMessage = `تم العثور على ${data.total} صورة (${typeInfo})`;
      
      if (data.sourceStats) {
        const sourceInfo = Object.entries(data.sourceStats as Record<string, number>)
          .map(([source, count]) => `${source}: ${count}`)
          .join(', ');
        successMessage += `\nمصادر الصور: ${sourceInfo}`;
      }
      
      if (apiMode === 'enhanced' && waitTime > 0) {
        successMessage += `\nتم الانتظار ${waitTime/1000} ثانية لتحميل الصور المتأخرة`;
      }
      
      if (apiMode === 'scroll' && data.attemptStats) {
        const attemptInfo = Object.entries(data.attemptStats as Record<string, number>)
          .map(([attempt, count]) => `محاولة ${parseInt(attempt) + 1}: ${count}`)
          .join(', ');
        successMessage += `\nمحاولات التمرير: ${attemptInfo}`;
        successMessage += `\nتم ${scrollAttempts} محاولات بفاصل ${waitBetweenScrolls/1000} ثانية`;
      }
      
      if (apiMode === 'puppeteer' && data.scrollStats) {
        const scrollInfo = Object.entries(data.scrollStats as Record<string, number>)
          .map(([pos, count]) => {
            const position = parseInt(pos);
            if (position === 0) return `البداية: ${count}`;
            if (position === -1) return `نهاية: ${count}`;
            return `${position}px: ${count}`;
          })
          .join(', ');
        successMessage += `\nمواضع التمرير: ${scrollInfo}`;
        successMessage += `\nتم استخدام متصفح حقيقي مع ${maxScrolls} محاولات تمرير`;
      }
      
      setSuccess(successMessage);
      
      // Get unique image types
      const types = [...new Set(data.images.map((img: ImageData) => img.type))] as string[];
      setSelectedTypes(types);
      
      // Select all images by default
      setSelectedImages(data.images.map((img: ImageData) => img.src));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageSrc: string, checked: boolean) => {
    if (checked) {
      setSelectedImages(prev => [...prev, imageSrc]);
    } else {
      setSelectedImages(prev => prev.filter(src => src !== imageSrc));
    }
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes(prev => [...prev, type]);
      // Add all images of this type to selection
      const imagesOfType = images.filter(img => img.type === type).map(img => img.src);
      setSelectedImages(prev => [...new Set([...prev, ...imagesOfType])]);
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type));
      // Remove all images of this type from selection
      const imagesOfType = images.filter(img => img.type === type).map(img => img.src);
      setSelectedImages(prev => prev.filter(src => !imagesOfType.includes(src)));
    }
  };

  const downloadAsZip = async () => {
    if (selectedImages.length === 0) {
      setError('يرجى اختيار صور للتحميل');
      return;
    }

    setDownloading(true);
    setError('');
    setSuccess('');

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
        throw new Error(data.error || 'فشل في تحميل الصور');
      }

      // Create ZIP file
      const zip = new JSZip();
      const successfulImages = data.images.filter((img: DownloadedImage) => img.success);

      successfulImages.forEach((img: DownloadedImage) => {
        zip.file(img.filename, img.data, { base64: true });
      });

      if (successfulImages.length === 0) {
        throw new Error('لم يتم تحميل أي صورة بنجاح');
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const domain = new URL(url).hostname;
      const filename = `images_${domain}_${new Date().toISOString().split('T')[0]}.zip`;
      
      saveAs(zipBlob, filename);
      setSuccess(`تم تحميل ${successfulImages.length} صورة بنجاح من أصل ${data.total}`);

      if (data.failed > 0) {
        setError(`فشل في تحميل ${data.failed} صورة`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحميل');
    } finally {
      setDownloading(false);
    }
  };

  const filteredImages = images.filter(img => selectedTypes.includes(img.type));
  const imageTypes = [...new Set(images.map(img => img.type))];

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            مستخرج الصور الذكي
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
            استخرج جميع الصور من أي موقع ويب بتقنية متطورة وواجهة عصرية
          </p>
        </div>

        {/* Main Content Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          {/* URL Input Section */}
          <div className="mb-8">
            <label className="flex items-center text-lg font-semibold text-white mb-4">
              <Globe className="w-6 h-6 mr-3 text-purple-300" />
              رابط الموقع:
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-lg"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                <Search className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            
            <button
              onClick={extractImages}
              disabled={loading}
              className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                onChange={(e) => setApiMode(e.target.value as 'basic' | 'enhanced' | 'scroll' | 'puppeteer')}
                className="mr-2"
              />
              <div>
                <div className="font-medium">محسن</div>
                <div className="text-sm text-gray-600">انتظار تحميل الصور المتأخرة</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="radio"
                name="apiMode"
                value="scroll"
                checked={apiMode === 'scroll'}
                onChange={(e) => setApiMode(e.target.value as 'basic' | 'enhanced' | 'scroll' | 'puppeteer')}
                className="mr-2"
              />
              <div>
                <div className="font-medium">محاكاة التمرير</div>
                <div className="text-sm text-gray-600">محاولات متعددة لاستخراج المزيد</div>
              </div>
            </label>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center p-3 border-2 border-green-500 rounded-lg cursor-pointer hover:bg-green-50 bg-green-25">
              <input
                type="radio"
                name="apiMode"
                value="puppeteer"
                checked={apiMode === 'puppeteer'}
                onChange={(e) => setApiMode(e.target.value as 'basic' | 'enhanced' | 'scroll' | 'puppeteer')}
                className="mr-2"
              />
              <div>
                <div className="font-medium text-green-700">متصفح حقيقي (موصى به) ✨</div>
                <div className="text-sm text-green-600">تمرير حقيقي في متصفح لاستخراج جميع الصور</div>
              </div>
            </label>
          </div>
          
          {/* Enhanced Mode Settings */}
          {apiMode === 'enhanced' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وقت الانتظار (بالثواني): {waitTime / 1000}
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="1000"
                value={waitTime}
                onChange={(e) => setWaitTime(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          
          {/* Scroll Mode Settings */}
          {apiMode === 'scroll' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد المحاولات: {scrollAttempts}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={scrollAttempts}
                    onChange={(e) => setScrollAttempts(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفاصل بين المحاولات (ثانية): {waitBetweenScrolls / 1000}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={waitBetweenScrolls}
                    onChange={(e) => setWaitBetweenScrolls(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Puppeteer Mode Settings */}
          {apiMode === 'puppeteer' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="mb-3 text-sm text-green-700 font-medium">
                ✨ إعدادات المتصفح الحقيقي - الطريقة الأفضل لاستخراج جميع الصور
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد محاولات التمرير: {maxScrolls}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="1"
                    value={maxScrolls}
                    onChange={(e) => setMaxScrolls(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">كلما زاد العدد، زادت الصور ولكن زاد الوقت</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأخير التمرير (ثانية): {scrollDelay / 1000}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={scrollDelay}
                    onChange={(e) => setScrollDelay(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">وقت الانتظار بين كل تمرير</div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                <strong>ملاحظة:</strong> هذه الطريقة تستخدم متصفح حقيقي وتقوم بالتمرير فعلياً في الصفحة، مما يضمن استخراج جميع الصور بما في ذلك الصور المحملة بشكل متأخر (lazy loading).
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Image Type Filters */}
      {imageTypes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">تصفية حسب نوع الصورة:</h3>
          <div className="flex flex-wrap gap-4">
            {imageTypes.map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={(e) => handleTypeFilter(type, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-600 uppercase">
                  {type} ({images.filter(img => img.type === type).length})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Download Section */}
      {filteredImages.length > 0 && (
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600">
            تم اختيار {selectedImages.length} من أصل {filteredImages.length} صورة
          </div>
          <button
            onClick={downloadAsZip}
            disabled={downloading || selectedImages.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'جاري التحميل...' : 'تحميل كـ ZIP'}
          </button>
        </div>
      )}

      {/* Images Grid */}
      {filteredImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <div className="absolute top-2 right-2">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.src)}
                  onChange={(e) => handleImageSelect(image.src, e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="truncate">{image.alt || 'بدون وصف'}</div>
                <div className="text-yellow-300">{image.type.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Images Message */}
      {!loading && images.length === 0 && url && (
        <div className="text-center py-12 text-gray-500">
          لم يتم العثور على صور في هذا الموقع
        </div>
      )}
    </div>
  );
}
