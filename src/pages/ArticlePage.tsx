import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Article, ArticleMetadata } from '@/domain';
import { FileAdapterLocal, GetArticleMetadata } from '@/infrastructure';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleImage } from '@/components/ArticleImage';
import { ShareButtons } from '@/components/ShareButtons';
import { ArticleContentWithAds } from '@/components/ArticleContentWithAds';
import { ResponsiveAdBanner, SidebarAdBanner } from '@/components/AdBanner';
import { useAdPlacements } from '@/hooks/useDeviceType';
import { shouldShowAd } from '@/utils/adUtils';
import { getAdSlot } from '@/config/adsConfig';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Services
  const fileAdapter = FileAdapterLocal.getInstance();
  const getArticleMetadata = new GetArticleMetadata(fileAdapter);

  // Ad placements
  const adPlacements = useAdPlacements();
  const showSidebarAd = shouldShowAd('sidebar', adPlacements.deviceType);
  const showFooterAd = shouldShowAd('footer', adPlacements.deviceType);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize the file adapter first
      await fileAdapter.initialize();

      const articleData = await getArticleMetadata.getBySlug(articleSlug);

      if (!articleData) {
        setError('Makale bulunamadı');
        return;
      }

      setArticle(articleData);

      // Load related articles
      const related = await getArticleMetadata.getRelated(articleData, 3);
      setRelatedArticles(related);

    } catch (err) {
      console.error('Failed to load article:', err);
      setError('Makale yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pregnancy: 'bg-pink-100 text-pink-800',
      babies: 'bg-blue-100 text-blue-800',
      family: 'bg-green-100 text-green-800',
      tips: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Share functionality moved to ShareButtons component

  const handleRelatedArticleClick = (relatedArticle: ArticleMetadata) => {
    navigate(`/article/${relatedArticle.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Makale bulunamadı'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Geri Dön</span>
      </button>

      {/* Article Header */}
      <header className="mb-8">
        {/* Category & Share */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </span>

          <div className="flex items-center space-x-3">
            <ShareButtons
              title={article.title}
              description={article.description}
              url={window.location.href}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-6">
          {article.description}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.date)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{article.readingTime} dakika okuma</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mt-8 aspect-video rounded-xl overflow-hidden bg-gray-100">
          <ArticleImage
            src={article.previewImage}
            alt={article.title}
            category={article.category}
            className="w-full h-full"
            loadingClassName="bg-gray-200"
          />
        </div>
      </header>

      {/* Article Content */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <article className="prose prose-lg max-w-none flex-1 break-words">
          <ArticleContentWithAds content={article.content} afterParagraph={adPlacements.showAfterParagraph} />
        </article>

        {/* Sidebar with Ad */}
        {showSidebarAd && (
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <SidebarAdBanner adSlot={getAdSlot('sidebar')} />
            </div>
          </aside>
        )}
      </div>

      {/* Footer Ad */}
      {showFooterAd && (
        <div className="mb-8">
          <ResponsiveAdBanner adSlot={getAdSlot('articleBottom')} />
        </div>
      )}

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Etiketler
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
            İlgili Makaleler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard
                key={relatedArticle.id}
                article={relatedArticle}
                onClick={handleRelatedArticleClick}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};