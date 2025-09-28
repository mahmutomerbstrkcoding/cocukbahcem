import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Article, ArticleMetadata } from '@/domain';
import { FileAdapterLocal, GetArticleMetadata } from '@/infrastructure';
import { ArticleCard } from '@/components/ArticleCard';
import { ShareButtons } from '@/components/ShareButtons';

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

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);

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
        {article.previewImage && (
          <div className="mt-8 aspect-video rounded-xl overflow-hidden bg-gray-100">
            <img
              src={article.previewImage}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none mb-12 break-words">
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mt-8 mb-4 break-words">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 mt-6 mb-3 break-words">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-4 mb-2 break-words">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-4 break-words overflow-wrap-anywhere">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 break-words">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 break-words">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="break-words overflow-wrap-anywhere">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 my-6 break-words">
                {children}
              </blockquote>
            ),
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-sm my-6 w-full max-w-full"
                loading="lazy"
              />
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-primary-600 hover:text-primary-700 underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm break-all">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto break-all">
                {children}
              </pre>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </article>

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