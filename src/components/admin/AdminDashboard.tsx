import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Article, ArticleMetadata } from '../../domain/entities/Article';
import { GetArticleMetadata } from '../../application/usecases/GetArticleMetadata';
import { FileAdapterLocal } from '../../infrastructure/adapters/FileAdapterLocal';
import { ArticleEditor } from './ArticleEditor';
import { Plus, Edit, Trash2, Eye, BarChart3, Users, TrendingUp, LogOut } from 'lucide-react';

const fileAdapter = FileAdapterLocal.getInstance();

export const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'articles'>('dashboard');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const getArticleMetadata = new GetArticleMetadata(fileAdapter);
      const articleList = await getArticleMetadata.getAll();
      setArticles(articleList);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNewArticle = () => {
    setSelectedArticle(null);
    setCurrentView('editor');
  };

  const handleEditArticle = async (id: string) => {
    try {
      const article = await fileAdapter.getArticle(id);
      setSelectedArticle(article);
      setCurrentView('editor');
    } catch (error) {
      console.error('Error loading article:', error);
    }
  };

  const handleSaveArticle = async (article: Article) => {
    try {
      if (selectedArticle) {
        await fileAdapter.updateArticle(article);
      } else {
        await fileAdapter.addArticle(article);
      }
      await loadArticles();
      setCurrentView('dashboard');
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) {
      try {
        await fileAdapter.deleteArticle(id);
        await loadArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setCurrentView('dashboard');
    setSelectedArticle(null);
  };

  const getCategoryTitle = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      pregnancy: 'Hamilelik',
      babies: 'Bebekler',
      family: 'Aile',
      tips: 'İpuçları'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      pregnancy: 'from-primary-100 to-primary-200 text-primary-700',
      babies: 'from-secondary-100 to-secondary-200 text-secondary-700',
      family: 'from-accent-100 to-accent-200 text-accent-700',
      tips: 'from-warning-100 to-warning-200 text-warning-700'
    };
    return colorMap[category] || 'from-gray-100 to-gray-200 text-gray-700';
  };

  const getStats = () => {
    const totalArticles = articles.length;
    const avgSeoScore = articles.reduce((sum, article) => sum + (article.seoScore || 0), 0) / totalArticles || 0;
    const categories = [...new Set(articles.map(a => a.category))].length;
    const recentArticles = articles.filter(a => {
      const articleDate = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return articleDate > weekAgo;
    }).length;

    return { totalArticles, avgSeoScore, categories, recentArticles };
  };

  if (currentView === 'editor') {
    return (
      <ArticleEditor
        article={selectedArticle || undefined}
        onSave={handleSaveArticle}
        onCancel={handleCancelEdit}
      />
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-600 mt-1">
                Hoş geldin, {user?.username} • Makale yönetimi ve site istatistikleri
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('articles')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'articles'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Makaleler
              </button>
              <button
                onClick={handleNewArticle}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Plus size={20} />
                <span>Yeni Makale</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl border border-primary-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-600 text-sm font-medium">Toplam Makale</p>
                    <p className="text-3xl font-bold text-primary-900">{stats.totalArticles}</p>
                    <p className="text-primary-600 text-xs mt-1">Yayınlanan makaleler</p>
                  </div>
                  <div className="w-14 h-14 bg-primary-200 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-6 rounded-xl border border-secondary-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-600 text-sm font-medium">Ortalama SEO Skoru</p>
                    <p className="text-3xl font-bold text-secondary-900">{Math.round(stats.avgSeoScore)}</p>
                    <p className="text-secondary-600 text-xs mt-1">100 üzerinden puan</p>
                  </div>
                  <div className="w-14 h-14 bg-secondary-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-secondary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-xl border border-accent-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-600 text-sm font-medium">Aktif Kategoriler</p>
                    <p className="text-3xl font-bold text-accent-900">{stats.categories}</p>
                    <p className="text-accent-600 text-xs mt-1">Farklı konu alanları</p>
                  </div>
                  <div className="w-14 h-14 bg-accent-200 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-accent-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-success-50 to-success-100 p-6 rounded-xl border border-success-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-success-600 text-sm font-medium">Bu Hafta</p>
                    <p className="text-3xl font-bold text-success-900">{stats.recentArticles}</p>
                    <p className="text-success-600 text-xs mt-1">Yeni eklenen</p>
                  </div>
                  <div className="w-14 h-14 bg-success-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-success-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-white/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Son Makaleler</h3>
                  <button
                    onClick={() => setCurrentView('articles')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>Tümünü Gör</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    Makaleler yükleniyor...
                  </div>
                ) : articles.slice(0, 5).map((article) => (
                  <div key={article.id} className="p-6 hover:bg-primary-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{article.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(article.category)}`}>
                            {getCategoryTitle(article.category)}
                          </span>
                          {/* SEO Score Badge - Admin Only */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            (article.seoScore || 0) >= 90 ? 'bg-success-100 text-success-800 border-success-200' :
                            (article.seoScore || 0) >= 70 ? 'bg-warning-100 text-warning-800 border-warning-200' :
                            'bg-danger-100 text-danger-800 border-danger-200'
                          }`}>
                            SEO: {article.seoScore || 0}/100
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📅 {new Date(article.date).toLocaleDateString('tr-TR')}</span>
                          <span>⏱️ {article.readingTime} dk okuma</span>
                          <span>🏷️ {article.tags.length} etiket</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                          className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditArticle(article.id)}
                          className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Düzenle"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-3 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentView === 'articles' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-white/50">
              <h3 className="text-xl font-bold text-gray-900">Tüm Makaleler ({articles.length})</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  Makaleler yükleniyor...
                </div>
              ) : articles.map((article) => (
                <div key={article.id} className="p-6 hover:bg-primary-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{article.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(article.category)}`}>
                          {getCategoryTitle(article.category)}
                        </span>
                        {/* SEO Score Badge - Admin Only */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          (article.seoScore || 0) >= 90 ? 'bg-success-100 text-success-800 border-success-200' :
                          (article.seoScore || 0) >= 70 ? 'bg-warning-100 text-warning-800 border-warning-200' :
                          'bg-danger-100 text-danger-800 border-danger-200'
                        }`}>
                          SEO: {article.seoScore || 0}/100
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.description}</p>
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <span>📅 {new Date(article.date).toLocaleDateString('tr-TR')}</span>
                        <span>⏱️ {article.readingTime} dk okuma</span>
                        <span>🏷️ {article.tags.length} etiket</span>
                        <span>📊 ID: {article.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Görüntüle"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditArticle(article.id)}
                        className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-3 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};