import React from 'react';
import { Eye, Settings } from 'lucide-react';

interface AdPlaceholderProps {
  type: 'banner' | 'sidebar' | 'inline' | 'footer';
  size?: 'small' | 'medium' | 'large';
  showConfig?: boolean;
  onConfigClick?: () => void;
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  type,
  size = 'medium',
  showConfig = false,
  onConfigClick,
  className = ''
}) => {
  const getSizeClasses = () => {
    const sizeMap = {
      banner: {
        small: 'h-16 w-full max-w-md',
        medium: 'h-20 w-full max-w-2xl',
        large: 'h-24 w-full max-w-4xl'
      },
      sidebar: {
        small: 'h-48 w-full max-w-xs',
        medium: 'h-64 w-full max-w-sm',
        large: 'h-80 w-full max-w-md'
      },
      inline: {
        small: 'h-32 w-full max-w-lg',
        medium: 'h-40 w-full max-w-2xl',
        large: 'h-48 w-full max-w-3xl'
      },
      footer: {
        small: 'h-16 w-full max-w-lg',
        medium: 'h-20 w-full max-w-2xl',
        large: 'h-24 w-full max-w-4xl'
      }
    };

    return sizeMap[type][size];
  };

  const getTypeLabel = () => {
    const typeMap = {
      banner: 'Banner Reklamı',
      sidebar: 'Kenar Reklamı',
      inline: 'İçerik Arası Reklam',
      footer: 'Alt Kısım Reklamı'
    };
    return typeMap[type];
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'banner':
        return '📱';
      case 'sidebar':
        return '📋';
      case 'inline':
        return '📄';
      case 'footer':
        return '📍';
      default:
        return '📢';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        ${getSizeClasses()}
        mx-auto
        bg-gradient-to-br from-gray-100 to-gray-200
        border-2 border-dashed border-gray-300
        rounded-lg
        flex flex-col items-center justify-center
        transition-all duration-300
        hover:from-blue-50 hover:to-blue-100
        hover:border-blue-300
        group
      `}>
        {/* Ad Placeholder Content */}
        <div className="text-center p-4">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {getTypeIcon()}
          </div>

          <div className="text-sm font-semibold text-gray-700 mb-1">
            {getTypeLabel()}
          </div>

          <div className="text-xs text-gray-500 mb-3">
            Reklam buraya gelecek
          </div>

          {/* Size indicator */}
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
            <span>{size === 'small' ? 'Küçük' : size === 'medium' ? 'Orta' : 'Büyük'}</span>
            <span>•</span>
            <span>{type}</span>
          </div>

          {/* Preview mode indicator */}
          <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-blue-600">
            <Eye className="w-3 h-3" />
            <span>Önizleme</span>
          </div>
        </div>

        {/* Config button for admin */}
        {showConfig && (
          <button
            onClick={onConfigClick}
            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-110"
            title="Reklam ayarlarını düzenle"
          >
            <Settings className="w-3 h-3 text-gray-600" />
          </button>
        )}

        {/* Floating label */}
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
          Demo
        </div>
      </div>
    </div>
  );
};

export default AdPlaceholder;