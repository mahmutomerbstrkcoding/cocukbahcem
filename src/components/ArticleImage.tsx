import React, { useState, useEffect } from 'react';
import { resolveImageUrl, getCategoryPlaceholder, isExternalUrl } from '@/utils/imageUtils';

interface ArticleImageProps {
  src?: string;
  alt: string;
  category: string;
  className?: string;
  loadingClassName?: string;
}

export const ArticleImage: React.FC<ArticleImageProps> = ({
  src,
  alt,
  category,
  className = '',
  loadingClassName = ''
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    setImageState('loading');

    if (!src) {
      // No image provided, use category placeholder
      setImageSrc(getCategoryPlaceholder(category));
      setImageState('loaded');
      return;
    }

    const resolvedUrl = resolveImageUrl(src);
    setImageSrc(resolvedUrl);

    // Test if image loads successfully
    const img = new Image();
    img.onload = () => setImageState('loaded');
    img.onerror = () => {
      // If local image fails, try category placeholder
      console.log(`Failed to load image: ${resolvedUrl}, using category placeholder`);
      setImageSrc(getCategoryPlaceholder(category));
      setImageState('loaded');
    };
    img.src = resolvedUrl;
  }, [src, category]);

  const getImageTypeIndicator = () => {
    if (!src) return null;

    return (
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`px-2 py-1 text-xs rounded-full text-white font-medium ${
            isExternalUrl(src)
              ? 'bg-blue-500 bg-opacity-80'
              : 'bg-green-500 bg-opacity-80'
          }`}
          title={isExternalUrl(src) ? 'External Image' : 'Local Image'}
        >
          {isExternalUrl(src) ? '🌐' : '📁'}
        </span>
      </div>
    );
  };

  if (imageState === 'loading') {
    return (
      <div className={`${className} ${loadingClassName}`}>
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={() => {
          // Final fallback if even the placeholder fails
          if (imageSrc !== getCategoryPlaceholder(category)) {
            setImageSrc(getCategoryPlaceholder(category));
          }
        }}
      />
      {getImageTypeIndicator()}

      {/* Image source overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 z-10">
          <span
            className="px-2 py-1 text-xs bg-black bg-opacity-60 text-white rounded text-ellipsis max-w-32 overflow-hidden whitespace-nowrap block"
            title={imageSrc}
          >
            {imageSrc.split('/').pop()?.substring(0, 15)}...
          </span>
        </div>
      )}
    </div>
  );
};