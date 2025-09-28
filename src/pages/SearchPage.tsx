import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleMetadata } from '@/domain';
import { FileAdapterLocal, GetArticleMetadata } from '@/infrastructure';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Services
  const fileAdapter = FileAdapterLocal.getInstance();
  const getArticleMetadata = new GetArticleMetadata(fileAdapter);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    if (query.trim()) {
      performSearch(query);
    } else {
      setArticles([]);
      setIsLoading(false);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      await fileAdapter.initialize();
      const results = await getArticleMetadata.searchArticles(query);
      setArticles(results);
    } catch (error) {
      console.error('Search failed:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleArticleClick = (article: ArticleMetadata) => {
    navigate(`/article/${article.slug}`);
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri Dön</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            Arama Sonuçları
          </h1>
          {searchQuery && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              "<span className="font-semibold text-primary-600">{searchQuery}</span>" için arama sonuçları
            </p>
          )}
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Makale ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
            <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Ara
            </button>
          </form>
        </div>

        {/* Results */}
        {searchQuery ? (
          <>
            {/* Results Count */}
            <div className="text-center mb-8">
              <p className="text-gray-600">
                <span className="font-semibold text-primary-600">{articles.length}</span> makale bulundu
              </p>
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="relative">
                    <ArticleCard
                      article={{
                        ...article,
                        title: highlightSearchTerm(article.title, searchQuery) as any,
                        description: highlightSearchTerm(article.description, searchQuery) as any,
                      }}
                      onClick={handleArticleClick}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-24 h-24 mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Sonuç bulunamadı</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  "<strong>{searchQuery}</strong>" için herhangi bir makale bulunamadı.
                  Farklı anahtar kelimeler deneyin.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/articles')}
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Tüm Makaleleri Görüntüle
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-24 h-24 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Arama yapın</h3>
            <p className="text-gray-600">
              Makale başlıkları, açıklamalar ve etiketlerde arama yapabilirsiniz.
            </p>
          </div>
        )}

        {/* Popular Searches / Suggestions */}
        {!searchQuery && (
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Popüler Arama Terimleri</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['hamilelik', 'bebek', 'beslenme', 'uyku', 'aile', 'sağlık', 'gelişim'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    navigate(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};