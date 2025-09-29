import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleCard } from '@/components/ArticleCard';
import { SmartAd } from '@/components/SmartAd';
import { ArticleMetadata } from '@/domain';
import { FileAdapterLocal, GetArticleMetadata } from '@/infrastructure';
import { getAdSlot, shouldShowAd } from '@/utils/adUtils';

interface HomePageProps {
  category?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ category }) => {
  const [featured, setFeatured] = useState<ArticleMetadata[]>([]);
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const navigate = useNavigate();

  // Services
  console.log('🔧 HomePage: Creating FileAdapter instance...');
  const fileAdapter = FileAdapterLocal.getInstance();
  const getArticleMetadata = new GetArticleMetadata(fileAdapter);
  console.log('✅ HomePage: FileAdapter and GetArticleMetadata created');

  useEffect(() => {
    console.log('🏠 HomePage useEffect triggered for category:', category);
    loadArticles();
  }, [category]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Initializing FileAdapter...');
      console.log('🏠 HomePage.loadArticles() called for category:', category);

      // Initialize the file adapter first
      console.log('🏗️ HomePage: Calling fileAdapter.reload() to force fresh load...');
      await fileAdapter.reload();
      console.log('✅ HomePage: FileAdapter reloaded');

      if (category) {
        console.log(`📂 Loading articles for category: ${category}`);
        setDebugInfo(`Loading category: ${category}`);
        const categoryArticles = await getArticleMetadata.getByCategory(category);
        console.log(`📊 Found ${categoryArticles.length} articles for category ${category}:`, categoryArticles);
        setDebugInfo(`Found ${categoryArticles.length} articles for category ${category}`);
        setArticles(categoryArticles);
        setFeatured([]);
      } else {
        console.log('🏠 Loading homepage articles (featured + all)');
        setDebugInfo('Loading homepage articles...');
        const [featuredArticles, allArticles] = await Promise.all([
          getArticleMetadata.getFeatured(3),
          getArticleMetadata.getAll({ limit: 12 })
        ]);
        console.log(`⭐ Featured articles: ${featuredArticles.length}`, featuredArticles);
        console.log(`📄 All articles: ${allArticles.length}`, allArticles);
        setDebugInfo(`Loaded ${featuredArticles.length} featured, ${allArticles.length} total articles`);
        setFeatured(featuredArticles);
        setArticles(allArticles);
      }
    } catch (error) {
      console.error('❌ Failed to load articles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleClick = (article: ArticleMetadata) => {
    navigate(`/article/${article.slug}`);
  };

  const getCategoryTitle = (cat?: string) => {
    const titles: Record<string, string> = {
      pregnancy: 'Hamilelik',
      babies: 'Bebekler',
      family: 'Aile',
      tips: 'İpuçları',
    };
    return cat ? titles[cat] || cat : 'Tüm Makaleler';
  };

  const getCategoryDescription = (cat?: string) => {
    const descriptions: Record<string, string> = {
      pregnancy: 'Hamilelik dönemi, beslenme ve sağlık bilgileri',
      babies: 'Bebek bakımı, gelişim ve sağlık rehberleri',
      family: 'Aile yaşamı ve ebeveynlik önerileri',
      tips: 'Pratik ipuçları ve günlük hayat önerileri',
    };
    return cat ? descriptions[cat] || '' : 'Anne ve bebek sağlığı hakkında en güncel makaleler';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mb-4"></div>
        <div className="text-lg text-gray-600">{debugInfo}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!category && featured.length > 0 && (
          <section className="mb-12">
            <div className="text-center mb-12 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full text-sm font-medium shadow-lg">
                    ✨ Güvenilir Anne & Bebek Rehberi
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent mb-6">
                  Çocuk Bahçem
                </h1>

                <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
                  Anne ve bebek sağlığı, hamilelik süreçleri ve aile yaşamına dair
                  <span className="text-primary-600 font-semibold"> uzman tavsiyeleri</span> ve
                  <span className="text-secondary-600 font-semibold"> pratik rehberler</span>
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                    <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-600">Uzman İçerik</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                    <span className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-600">Güncel Bilgiler</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-600">Pratik Öneriler</span>
                  </div>
                </div>
              </div>
            </div>          {/* Featured Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((article) => (
              <div key={article.id} className="relative">
                <ArticleCard article={article} onClick={handleArticleClick} />
                <div className="absolute -top-3 -left-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Öne Çıkan
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Header */}
      {category && (
        <section className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              {getCategoryTitle(category)}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {getCategoryDescription(category)}
            </p>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-accent-100/30 rounded-full opacity-50 animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-secondary-100/30 rounded-full opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                {category ? 'Makaleler' : 'Son Makaleler'}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {category ? 'Bu kategorideki tüm makaleler' : 'En güncel uzman önerilerimiz'}
              </p>

              {!category && articles.length > 0 && (
                <div className="inline-flex items-center justify-center">
                  <button
                    onClick={() => navigate('/articles')}
                    className="group relative overflow-hidden bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 transform"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* Content */}
                    <div className="relative flex items-center space-x-3">
                      <span>Tüm Makaleleri Keşfet</span>
                      <div className="transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>

                    {/* Floating particles effect */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                      <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" style={{animationDelay: '0s'}}></div>
                      <div className="absolute top-4 right-6 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-3 left-8 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" style={{animationDelay: '1s'}}></div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={handleArticleClick}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz makale yok</h3>
            <p className="text-gray-600">
              {category
                ? `${getCategoryTitle(category)} kategorisinde henüz makale bulunmuyor.`
                : 'Henüz hiç makale eklenmemiş.'
              }
            </p>
          </div>
        )}
      </section>

      {/* Mid-page Ad */}
      {!category && shouldShowAd('inline', 'desktop') && (
        <section className="mt-12 mb-8">
          <SmartAd
            type="inline"
            size="large"
            slotId={getAdSlot('articleMiddle')}
            className="text-center"
          />
        </section>
      )}

      {/* Categories Section (only on homepage) */}
      {!category && (
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent mb-4">
              Kategoriler
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İhtiyacınıza uygun konuları keşfedin ve uzman tavsiyeleriyle donatılmış içeriklere ulaşın
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { key: 'pregnancy', title: 'Hamilelik', description: 'Hamilelik süreci rehberleri', icon: '🤱', gradient: 'from-primary-100 to-primary-200' },
              { key: 'babies', title: 'Bebekler', description: 'Bebek bakımı ve gelişimi', icon: '👶', gradient: 'from-secondary-100 to-secondary-200' },
              { key: 'family', title: 'Aile', description: 'Aile yaşamı önerileri', icon: '👨‍👩‍👧‍👦', gradient: 'from-accent-100 to-accent-200' },
              { key: 'tips', title: 'İpuçları', description: 'Pratik günlük ipuçları', icon: '💡', gradient: 'from-warning-100 to-warning-200' },
            ].map((cat, index) => (
              <button
                key={cat.key}
                onClick={() => navigate(`/${cat.key}`)}
                className={`relative p-8 bg-gradient-to-br ${cat.gradient} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-3 text-left group border border-white/50 hover:border-white overflow-hidden`}
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
                    {cat.title}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                    {cat.description}
                  </p>

                  {/* Arrow icon */}
                  <div className="mt-4 flex justify-end">
                    <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center group-hover:bg-white/80 group-hover:scale-110 transition-all duration-300">
                      <span className="text-gray-600 group-hover:text-primary-600 transition-colors duration-300">→</span>
                    </div>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Ad */}
      {shouldShowAd('footer', 'desktop') && (
        <section className="mt-16 mb-8">
          <SmartAd
            type="footer"
            size="large"
            slotId={getAdSlot('articleBottom')}
            className="text-center"
          />
        </section>
      )}
      </div>
    </div>
  );
};