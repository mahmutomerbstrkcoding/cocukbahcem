import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleMetadata } from '@/domain';
import { FileAdapterLocal, GetArticleMetadata } from '@/infrastructure';
import { SmartAd } from '@/components/SmartAd';
import { getCategoryDisplayName, getCategoryIcon } from '@/utils/categoryMapping';

export const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  // Services
  const fileAdapter = FileAdapterLocal.getInstance();
  const getArticleMetadata = new GetArticleMetadata(fileAdapter);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);

      await fileAdapter.initialize();

      let allArticles: ArticleMetadata[];

      if (selectedCategory === 'all') {
        allArticles = await getArticleMetadata.getAll();
      } else {
        allArticles = await getArticleMetadata.getByCategory(selectedCategory);
      }

      setArticles(allArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleClick = (article: ArticleMetadata) => {
    navigate(`/article/${article.slug}`);
  };

  const getCategoryTitle = (category: string) => {
    if (category === 'all') return 'Tüm Makaleler';
    return getCategoryDisplayName(category);
  };

  const categories = [
    { key: 'all', title: 'Tümü', icon: '📚' },
    { key: 'aile-hayati', title: 'Aile Hayatı', icon: getCategoryIcon('aile-hayati') },
    { key: 'bebekler', title: 'Bebekler', icon: getCategoryIcon('bebekler') },
    { key: 'hamilelik', title: 'Hamilelik', icon: getCategoryIcon('hamilelik') },
    { key: 'okul-oncesi', title: 'Okul Öncesi', icon: getCategoryIcon('okul-oncesi') },
    { key: 'ipuclari', title: 'İpuçları', icon: getCategoryIcon('ipuclari') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#f7b2bd]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Tüm Makaleler
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Anne ve bebek sağlığı konularında uzman önerileri ve pratik rehberler
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.key
                  ? 'bg-[#f7b2bd] text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-[#f7b2bd] hover:text-white shadow-sm border'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.title}</span>
            </button>
          ))}
        </div>

        {/* Articles Count */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            <span className="font-semibold text-primary-600">{articles.length}</span> makale bulundu
            {selectedCategory !== 'all' && (
              <span> - {getCategoryTitle(selectedCategory)} kategorisinde</span>
            )}
          </p>
        </div>

        {/* Top Banner Ad */}
        <div className="mb-8">
          <SmartAd
            type="banner"
            size="large"
            className="mx-auto"
          />
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Makale bulunamadı</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all'
                ? 'Henüz hiç makale eklenmemiş.'
                : `${getCategoryTitle(selectedCategory)} kategorisinde henüz makale bulunmuyor.`
              }
            </p>
          </div>
        )}

        {/* Footer Ad */}
        <div className="mt-12 mb-8">
          <SmartAd
            type="footer"
            size="large"
            className="mx-auto"
          />
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};