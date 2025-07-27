'use client';

import { useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  imageType: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  language: 'ar' | 'en' | 'fr';
}

const translations = {
  ar: {
    close: 'إغلاق',
    download: 'تحميل',
    previous: 'السابق',
    next: 'التالي',
    noDescription: 'بدون وصف'
  },
  en: {
    close: 'Close',
    download: 'Download',
    previous: 'Previous',
    next: 'Next',
    noDescription: 'No description'
  },
  fr: {
    close: 'Fermer',
    download: 'Télécharger',
    previous: 'Précédent',
    next: 'Suivant',
    noDescription: 'Aucune description'
  }
};

export default function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  imageType,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  language
}: ImageModalProps) {
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]);

  const handleDownload = async () => {
    try {
      // Try to fetch the image with proper headers
      const response = await fetch(imageSrc, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Generate filename
      const urlParts = imageSrc.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const filename = lastPart.split('?')[0] || `image-${Date.now()}.${imageType || 'jpg'}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Download failed, trying fallback:', error);
      
      // Fallback method: create a canvas and convert to blob
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `image-${Date.now()}.png`;
              link.style.display = 'none';
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
            }
          });
        };
        
        img.onerror = () => {
          // Last resort: open in new tab
          window.open(imageSrc, '_blank');
        };
        
        img.src = imageSrc;
        
      } catch (canvasError) {
        console.error('Canvas fallback failed:', canvasError);
        // Final fallback: open in new tab
        window.open(imageSrc, '_blank');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={onClose}>
      {/* Modal Content */}
      <div className="relative max-w-7xl max-h-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation Buttons */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <div className="flex items-center justify-center max-h-screen">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIExvYWRpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm mb-1">{imageAlt || t.noDescription}</div>
              <div className="text-xs text-gray-300 uppercase">{imageType}</div>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              {t.download}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
