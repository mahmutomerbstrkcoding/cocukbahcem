import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { ArticleMetadata } from '@/domain';
import { ArticleImage } from './ArticleImage';

interface ArticleCardProps {
  article: ArticleMetadata;
  onClick?: (article: ArticleMetadata) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const handleClick = () => {
    onClick?.(article);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pregnancy: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg',
      babies: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg',
      family: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg',
      tips: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      pregnancy: 'Hamilelik',
      babies: 'Bebekler',
      family: 'Aile',
      tips: 'İpuçları',
    };
    return labels[category] || category;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article
      className="article-card group"
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Image */}
      <div className="relative aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
        <ArticleImage
          src={article.previewImage}
          alt={article.title}
          category={article.category}
          className="w-full h-full"
          loadingClassName="bg-gray-200"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
          {article.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
          {article.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Date */}
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.date)}</span>
            </div>

            {/* Reading Time */}
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime} dk</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs text-gray-500">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};