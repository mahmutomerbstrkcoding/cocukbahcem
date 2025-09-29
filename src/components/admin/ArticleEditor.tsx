import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveAs } from 'file-saver';
import { Article, ArticleMetadata } from '../../domain/entities/Article';
import { GetArticleMetadata } from '../../application/usecases/GetArticleMetadata';
import { FileAdapterLocal } from '../../infrastructure/adapters/FileAdapterLocal';
import { Save, Eye, EyeOff, Upload, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface ArticleFormData {
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  previewImage: string;
  date: string;
  relatedArticles: string[];
}

interface SEOScore {
  title: number;
  description: number;
  content: number;
  keywords: number;
  overall: number;
}

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
}

const fileAdapter = FileAdapterLocal.getInstance();

export const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [availableArticles, setAvailableArticles] = useState<ArticleMetadata[]>([]);
  const [seoScore, setSeoScore] = useState<SEOScore>({ title: 0, description: 0, content: 0, keywords: 0, overall: 0 });
  const [canPublish, setCanPublish] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ArticleFormData>({
    defaultValues: {
      title: article?.title || '',
      content: article?.content || '',
      description: article?.description || '',
      category: article?.category || '',
      tags: article?.tags?.join(', ') || '',
      metaTitle: article?.seo?.metaTitle || '',
      metaDescription: article?.seo?.metaDescription || '',
      keywords: article?.seo?.keywords?.join(', ') || '',
      previewImage: article?.previewImage || '',
      date: article?.date || new Date().toISOString().split('T')[0],
      relatedArticles: []
    }
  });

  const watchedValues = watch();

  // Load available articles for related articles dropdown
  useEffect(() => {
    const loadArticles = async () => {
      const getArticleMetadata = new GetArticleMetadata(fileAdapter);
      const articles = await getArticleMetadata.getAll();
      setAvailableArticles(articles.filter((a: ArticleMetadata) => a.id !== article?.id));
    };
    loadArticles();
  }, [article?.id]);

  // Calculate SEO score
  useEffect(() => {
    const calculateSEOScore = () => {
      const scores = {
        title: 0,
        description: 0,
        content: 0,
        keywords: 0,
        overall: 0
      };

      // Title score (0-25)
      if (watchedValues.metaTitle) {
        const titleLength = watchedValues.metaTitle.length;
        if (titleLength >= 30 && titleLength <= 60) {
          scores.title = 25;
        } else if (titleLength >= 20 && titleLength <= 70) {
          scores.title = 20;
        } else if (titleLength >= 10) {
          scores.title = 15;
        }
      }

      // Description score (0-25)
      if (watchedValues.metaDescription) {
        const descLength = watchedValues.metaDescription.length;
        if (descLength >= 120 && descLength <= 160) {
          scores.description = 25;
        } else if (descLength >= 100 && descLength <= 180) {
          scores.description = 20;
        } else if (descLength >= 50) {
          scores.description = 15;
        }
      }

      // Content score (0-25)
      if (watchedValues.content) {
        const contentLength = watchedValues.content.length;
        const hasHeadings = /#{1,6}\s/.test(watchedValues.content);
        const hasLinks = /\[.*\]\(.*\)/.test(watchedValues.content);

        let contentScore = 0;
        if (contentLength >= 1000) contentScore += 15;
        else if (contentLength >= 500) contentScore += 10;
        else if (contentLength >= 200) contentScore += 5;

        if (hasHeadings) contentScore += 5;
        if (hasLinks) contentScore += 5;

        scores.content = Math.min(contentScore, 25);
      }

      // Keywords score (0-25)
      if (watchedValues.keywords) {
        const keywords = watchedValues.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k);
        if (keywords.length >= 3 && keywords.length <= 10) {
          scores.keywords = 25;
        } else if (keywords.length >= 1) {
          scores.keywords = 15;
        }
      }

      scores.overall = scores.title + scores.description + scores.content + scores.keywords;
      setSeoScore(scores);
      setCanPublish(scores.overall === 100);
    };

    calculateSEOScore();
  }, [watchedValues]);

  const generateMarkdownFile = (articleData: Article): string => {
    const frontmatter = `---
id: ${articleData.id}
title: "${articleData.title}"
date: ${articleData.date}
category: ${articleData.category}
slug: ${articleData.slug}
description: "${articleData.description}"
previewImage: "${articleData.previewImage}"
tags: [${articleData.tags.map(tag => `"${tag}"`).join(', ')}]
readingTime: ${articleData.readingTime}
seoScore: ${articleData.seoScore}
seo:
  metaTitle: "${articleData.seo.metaTitle}"
  metaDescription: "${articleData.seo.metaDescription}"
  canonical: "${articleData.seo.canonical}"
  ogImage: "${articleData.seo.ogImage}"
  twitterCard: "${articleData.seo.twitterCard}"
  keywords: [${articleData.seo.keywords.map(k => `"${k}"`).join(', ')}]
relatedArticles: [${watchedValues.relatedArticles?.map(id => `"${id}"`).join(', ') || ''}]
createdAt: ${articleData.createdAt.toISOString()}
updatedAt: ${articleData.updatedAt.toISOString()}
---

${articleData.content}`;

    return frontmatter;
  };

  const onSubmit = (data: ArticleFormData) => {
    if (!canPublish) {
      alert('SEO skoru 100 olmadan makale yayınlanamaz!');
      return;
    }

    const articleData: Article = {
      id: article?.id || `article-${Date.now()}`,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      title: data.title,
      content: data.content,
      description: data.description,
      category: data.category,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      previewImage: data.previewImage,
      date: data.date,
      readingTime: Math.ceil(data.content.split(' ').length / 200),
      seo: {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonical: `/${data.category}/${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        ogImage: data.previewImage,
        twitterCard: 'summary_large_image' as const,
        keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k)
      },
      seoScore: seoScore.overall,
      createdAt: article?.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Generate markdown file content
    const markdownContent = generateMarkdownFile(articleData);

    // Create filename with category and date
    const filename = `${articleData.date}-${articleData.slug}.md`;

    // Download the file
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);

    // Show success message with instructions
    alert(`✅ Makale başarıyla oluşturuldu ve indirildi!

📁 Dosyayı şu klasöre kaydedin:
public/articles/${articleData.category}/${filename}

🔧 Önemli: Aşağıdaki adımları takip edin:

1. İndirilen dosyayı yukarıdaki klasöre kaydedin
2. public/articles/index.json dosyasını açın
3. "articles" dizisine şu satırı ekleyin:
   {
     "category": "${articleData.category}",
     "filename": "${filename}"
   }
4. Sayfayı yenileyin

İndirilen dosya: ${filename}`);

    // Still call onSave for immediate preview (will be lost on refresh until file is saved)
    onSave(articleData);
  };

  const categories = [
    { value: 'pregnancy', label: 'Hamilelik' },
    { value: 'babies', label: 'Bebekler' },
    { value: 'family', label: 'Aile' },
    { value: 'tips', label: 'İpuçları' }
  ];

  const handleImagePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would upload the file and get a URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setValue('previewImage', e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 20) return 'text-success-600 bg-success-100';
    if (score >= 15) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getSEOFeedback = () => {
    const feedback = [];

    if (seoScore.title < 25) {
      if (!watchedValues.metaTitle) {
        feedback.push('SEO başlık boş olamaz');
      } else if (watchedValues.metaTitle.length < 30) {
        feedback.push('SEO başlık çok kısa (en az 30 karakter)');
      } else if (watchedValues.metaTitle.length > 60) {
        feedback.push('SEO başlık çok uzun (en fazla 60 karakter)');
      }
    }

    if (seoScore.description < 25) {
      if (!watchedValues.metaDescription) {
        feedback.push('SEO açıklama boş olamaz');
      } else if (watchedValues.metaDescription.length < 120) {
        feedback.push('SEO açıklama çok kısa (en az 120 karakter)');
      } else if (watchedValues.metaDescription.length > 160) {
        feedback.push('SEO açıklama çok uzun (en fazla 160 karakter)');
      }
    }

    if (seoScore.content < 25) {
      if (!watchedValues.content) {
        feedback.push('Makale içeriği boş olamaz');
      } else if (watchedValues.content.length < 1000) {
        feedback.push('İçerik çok kısa (en az 1000 karakter)');
      } else if (!/#{1,6}\s/.test(watchedValues.content)) {
        feedback.push('İçerikte başlık (# ## ###) kullanın');
      } else if (!/\[.*\]\(.*\)/.test(watchedValues.content)) {
        feedback.push('İçerikte bağlantı (link) ekleyin');
      }
    }

    if (seoScore.keywords < 25) {
      if (!watchedValues.keywords) {
        feedback.push('SEO anahtar kelimeler boş olamaz');
      } else {
        const keywords = watchedValues.keywords.split(',').map(k => k.trim()).filter(k => k);
        if (keywords.length < 3) {
          feedback.push('En az 3 anahtar kelime girin');
        } else if (keywords.length > 10) {
          feedback.push('En fazla 10 anahtar kelime girin');
        }
      }
    }

    return feedback;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          {article ? 'Makale Düzenle' : 'Yeni Makale Ekle'}
        </h1>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {isPreviewMode ? <EyeOff size={20} /> : <Eye size={20} />}
            <span>{isPreviewMode ? 'Düzenle' : 'Önizle'}</span>
          </button>
        </div>
      </div>

      {/* SEO Feedback Alert - Top Priority */}
      {!canPublish && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-xl shadow-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-3">
                🚨 SEO Skoru 100 Olmadan Makale Yayınlanamaz!
              </h3>
              <div className="space-y-2">
                {getSEOFeedback().map((feedback, index) => (
                  <div key={index} className="flex items-center space-x-2 text-red-700">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span className="font-medium">{feedback}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-red-600">
                <strong>Mevcut Skor: {seoScore.overall}/100</strong> - Kalan: {100 - seoScore.overall} puan
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Score Panel - Admin Only */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">SEO Skoru (Admin)</h3>
          <div className="flex items-center space-x-2">
            {canPublish ? (
              <CheckCircle className="w-6 h-6 text-success-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            )}
            <span className={`text-2xl font-bold ${canPublish ? 'text-success-600' : 'text-warning-600'}`}>
              {seoScore.overall}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className={`p-3 rounded-lg ${getSEOScoreColor(seoScore.title)}`}>
            <div className="text-sm font-medium">Başlık</div>
            <div className="text-lg font-bold">{seoScore.title}/25</div>
          </div>
          <div className={`p-3 rounded-lg ${getSEOScoreColor(seoScore.description)}`}>
            <div className="text-sm font-medium">Açıklama</div>
            <div className="text-lg font-bold">{seoScore.description}/25</div>
          </div>
          <div className={`p-3 rounded-lg ${getSEOScoreColor(seoScore.content)}`}>
            <div className="text-sm font-medium">İçerik</div>
            <div className="text-lg font-bold">{seoScore.content}/25</div>
          </div>
          <div className={`p-3 rounded-lg ${getSEOScoreColor(seoScore.keywords)}`}>
            <div className="text-sm font-medium">Anahtar K.</div>
            <div className="text-lg font-bold">{seoScore.keywords}/25</div>
          </div>
        </div>

        {canPublish && (
          <div className="bg-success-100 border border-success-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-success-800">
              <CheckCircle size={20} />
              <span className="font-medium">🎉 Mükemmel! SEO skoru 100/100. Makale yayına hazır!</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Başlık gereklidir' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Makale başlığını girin..."
                  />
                )}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Kategori gereklidir' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Kategori seçin...</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiketler (virgülle ayırın)
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="hamilelik, bebek, sağlık..."
                  />
                )}
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öne Çıkan Görsel
              </label>
              <div className="flex space-x-4">
                <Controller
                  name="previewImage"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Görsel URL'si..."
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={handleImagePick}
                  className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                >
                  <Upload size={20} />
                  <span>Yükle</span>
                </button>
              </div>
            </div>

            {/* Related Articles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlgili Makaleler
              </label>
              <Controller
                name="relatedArticles"
                control={control}
                render={({ field }) => (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                    {availableArticles.length > 0 ? (
                      <div className="space-y-3">
                        {availableArticles.map(article => (
                          <label key={article.id} className="flex items-start space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              value={article.id}
                              checked={field.value?.includes(article.id) || false}
                              onChange={(e) => {
                                const currentValue = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentValue, article.id]);
                                } else {
                                  field.onChange(currentValue.filter((id: string) => id !== article.id));
                                }
                              }}
                              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {article.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {article.category} • {typeof article.date === 'string' ? article.date : new Date(article.date).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <div className="text-2xl mb-2">📄</div>
                        <p className="text-sm">Henüz başka makale yok</p>
                      </div>
                    )}
                  </div>
                )}
              />
              <p className="text-sm text-gray-500 mt-1">
                İlgili makaleleri işaretleyerek seçebilirsiniz
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Başlık <span className="text-red-500">*</span>
              </label>
              <Controller
                name="metaTitle"
                control={control}
                rules={{ required: 'SEO başlık gereklidir' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="30-60 karakter arası..."
                  />
                )}
              />
              <p className="text-sm text-gray-500 mt-1">
                {watchedValues.metaTitle?.length || 0}/60 karakter
              </p>
              {errors.metaTitle && <p className="text-red-500 text-sm mt-1">{errors.metaTitle.message}</p>}
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Açıklama <span className="text-red-500">*</span>
              </label>
              <Controller
                name="metaDescription"
                control={control}
                rules={{ required: 'SEO açıklama gereklidir' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="120-160 karakter arası..."
                  />
                )}
              />
              <p className="text-sm text-gray-500 mt-1">
                {watchedValues.metaDescription?.length || 0}/160 karakter
              </p>
              {errors.metaDescription && <p className="text-red-500 text-sm mt-1">{errors.metaDescription.message}</p>}
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Anahtar Kelimeler <span className="text-red-500">*</span>
              </label>
              <Controller
                name="keywords"
                control={control}
                rules={{ required: 'SEO anahtar kelimeler gereklidir' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="hamilelik, bebek bakımı, anne sağlığı..."
                  />
                )}
              />
              {errors.keywords && <p className="text-red-500 text-sm mt-1">{errors.keywords.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Açıklama gereklidir' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Makale açıklamasını girin..."
                  />
                )}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yayın Tarihi
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İçerik (Markdown) <span className="text-red-500">*</span>
          </label>
          {isPreviewMode ? (
            <div className="w-full min-h-96 p-6 border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="prose prose-lg max-w-none">
                {watchedValues.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-800 mb-3 mt-6">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">{children}</h3>,
                      p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">{children}</ol>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-primary-300 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                      code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                      pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{children}</pre>,
                      a: ({ href, children }) => <a href={href} className="text-primary-600 hover:text-primary-800 underline">{children}</a>,
                      strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                    }}
                  >
                    {watchedValues.content}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <p>İçerik henüz girilmedi...</p>
                    <p className="text-sm mt-2">Markdown formatında içerik yazmaya başlayın</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Controller
              name="content"
              control={control}
              rules={{ required: 'İçerik gereklidir' }}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                  placeholder="Markdown formatında içerik girin..."
                />
              )}
            />
          )}
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!canPublish}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
              canPublish
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:scale-105 hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save size={20} />
            <span>{article ? 'Güncelle' : 'Yayınla'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};