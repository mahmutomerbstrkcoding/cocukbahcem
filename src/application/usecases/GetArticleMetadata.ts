import { Article, ArticleMetadata } from '@/domain';
import { FileAdapterLocal } from '@/infrastructure';
import { mapOldCategoryToNew } from '@/utils/categoryMapping';

export interface GetArticleFilters {
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class GetArticleMetadata {
  constructor(private fileAdapter: FileAdapterLocal) {}

  async getAll(filters?: GetArticleFilters): Promise<ArticleMetadata[]> {
    console.log('🔍 GetArticleMetadata.getAll called with filters:', filters);
    let articles = await this.fileAdapter.getArticles();
    console.log(`📊 GetArticleMetadata.getAll: FileAdapter returned ${articles.length} articles`);

    // Apply filters
    if (filters?.category) {
      articles = articles.filter(article => article.category === filters.category);
      console.log(`🏷️ GetArticleMetadata.getAll: Filtered to ${articles.length} articles for category: ${filters.category}`);
    }

    if (filters?.tags && filters.tags.length > 0) {
      articles = articles.filter(article =>
        filters.tags!.some(tag => article.tags.includes(tag))
      );
      console.log(`🏷️ GetArticleMetadata.getAll: Filtered to ${articles.length} articles for tags: ${filters.tags}`);
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    if (filters?.offset || filters?.limit) {
      const start = filters.offset || 0;
      const end = filters.limit ? start + filters.limit : undefined;
      articles = articles.slice(start, end);
      console.log(`📄 GetArticleMetadata.getAll: Paginated to ${articles.length} articles (offset: ${start}, limit: ${filters.limit})`);
    }

    console.log(`✅ GetArticleMetadata.getAll: Returning ${articles.length} articles`);
    return articles;
  }

  async getBySlug(slug: string): Promise<Article | null> {
    return await this.fileAdapter.getArticleBySlug(slug);
  }

  async getByCategory(category: string): Promise<ArticleMetadata[]> {
    console.log(`🏷️ GetArticleMetadata.getByCategory called with category: ${category}`);

    // The category parameter is already the file system category name (mapped by HomePage)
    // So we use it directly without additional mapping
    const articles = await this.fileAdapter.getArticlesByCategory(category);
    console.log(`📊 Found ${articles.length} articles for category ${category}`);

    // Update the category field in returned articles to use new naming
    const updatedArticles = articles.map(article => ({
      ...article,
      category: mapOldCategoryToNew(article.category)
    }));

    return updatedArticles;
  }

  async getFeatured(count: number = 3): Promise<ArticleMetadata[]> {
    console.log(`⭐ GetArticleMetadata.getFeatured called with count: ${count}`);
    const articles = await this.fileAdapter.getArticles();
    console.log(`📊 GetArticleMetadata.getFeatured: FileAdapter returned ${articles.length} articles`);

    // Sort by SEO score and date for featured articles
    const featured = articles
      .sort((a, b) => {
        const scoreA = a.seoScore || 0;
        const scoreB = b.seoScore || 0;

        if (scoreA === scoreB) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        return scoreB - scoreA;
      })
      .slice(0, count);

    console.log(`⭐ GetArticleMetadata.getFeatured: Returning ${featured.length} featured articles`);
    return featured;
  }

  async getRecent(count: number = 5): Promise<ArticleMetadata[]> {
    const articles = await this.fileAdapter.getArticles();

    return articles
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  }

  async getRelated(article: Article, count: number = 3): Promise<ArticleMetadata[]> {
    const allArticles = await this.fileAdapter.getArticles();

    // Filter out current article
    const otherArticles = allArticles.filter(a => a.id !== article.id);

    // Score articles based on similarity
    const scoredArticles = otherArticles.map(otherArticle => {
      let score = 0;

      // Same category gets high score
      if (otherArticle.category === article.category) {
        score += 10;
      }

      // Shared tags
      const sharedTags = otherArticle.tags.filter(tag => article.tags.includes(tag));
      score += sharedTags.length * 3;

      // Recent articles get slight boost
      const daysDiff = Math.abs(
        new Date(article.date).getTime() - new Date(otherArticle.date).getTime()
      ) / (1000 * 60 * 60 * 24);

      if (daysDiff < 30) {
        score += 2;
      } else if (daysDiff < 90) {
        score += 1;
      }

      return {
        article: otherArticle,
        score
      };
    });

    // Sort by score and return top articles
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.article);
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const articles = await this.fileAdapter.getArticles();

    const categoryCount: { [key: string]: number } = {};

    articles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTags(): Promise<{ tag: string; count: number }[]> {
    const articles = await this.fileAdapter.getArticles();

    const tagCount: { [key: string]: number } = {};

    articles.forEach(article => {
      article.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  async searchArticles(query: string): Promise<ArticleMetadata[]> {
    const articles = await this.fileAdapter.getArticles();
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return [];
    }

    return articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = article.description.toLowerCase().includes(searchTerm);
      const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      const categoryMatch = article.category.toLowerCase().includes(searchTerm);

      return titleMatch || descriptionMatch || tagMatch || categoryMatch;
    });
  }
}