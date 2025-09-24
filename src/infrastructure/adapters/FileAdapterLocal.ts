import { Article, ArticleMetadata } from '@/domain';
import '@/utils/buffer-polyfill'; // Import buffer polyfill before gray-matter
import matter from 'gray-matter';

// Mock file adapter for development
// In production, this would be replaced with actual file system access or API calls
export class FileAdapterLocal {
  private static instance: FileAdapterLocal;
  private mockArticles: Article[] = [];
  private articlesLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    console.log('🏗️ FileAdapterLocal: Constructor called - creating singleton instance');
    // Only load articles dynamically from index.json - no hardcoded data
    // Don't start loading immediately - wait for explicit call
  }

  // Public method to start loading
  async initialize(): Promise<void> {
    if (!this.loadingPromise) {
      console.log('🚀 FileAdapterLocal: Starting initialization...');
      this.loadingPromise = this.loadArticleFiles();
    }
    return this.loadingPromise;
  }

  // Public method to force reload articles (useful after fixing issues)
  async reload(): Promise<void> {
    console.log('🔄 FileAdapterLocal: Force reloading articles...');
    this.articlesLoaded = false;
    this.mockArticles = [];
    this.loadingPromise = null;
    return this.initialize();
  }

  static getInstance(): FileAdapterLocal {
    if (!FileAdapterLocal.instance) {
      console.log('🔧 FileAdapterLocal: Creating new singleton instance');
      FileAdapterLocal.instance = new FileAdapterLocal();
    } else {
      console.log('♻️ FileAdapterLocal: Returning existing singleton instance');
    }
    return FileAdapterLocal.instance;
  }



  private async ensureArticlesLoaded(): Promise<void> {
    console.log(`🔍 FileAdapterLocal: ensureArticlesLoaded called - articlesLoaded: ${this.articlesLoaded}, loadingPromise: ${!!this.loadingPromise}`);

    // Initialize if not started
    if (!this.loadingPromise && !this.articlesLoaded) {
      console.log('🚀 FileAdapterLocal: No loading promise found, starting initialization...');
      this.loadingPromise = this.loadArticleFiles();
    }

    if (!this.articlesLoaded && this.loadingPromise) {
      console.log('⏳ FileAdapterLocal: Waiting for articles to load...');
      await this.loadingPromise;
      console.log(`✅ FileAdapterLocal: Articles loading complete. Total: ${this.mockArticles.length}`);
    } else if (this.articlesLoaded) {
      console.log(`📊 FileAdapterLocal: Articles already loaded. Total: ${this.mockArticles.length}`);
    } else {
      console.log('⚠️ FileAdapterLocal: No loading promise available');
    }
  }

  private async loadArticleFiles(): Promise<void> {
    try {
      console.log('🔄 FileAdapterLocal: Starting to load articles from files...');

      // Load article index to get list of all articles
      const indexResponse = await fetch('/articles/index.json');
      if (!indexResponse.ok) {
        console.error('❌ FileAdapterLocal: Could not load articles index:', indexResponse.status, indexResponse.statusText);
        this.articlesLoaded = true;
        return;
      }

      const index = await indexResponse.json();
      console.log('✅ FileAdapterLocal: Loaded index with', index.articles?.length || 0, 'articles');

      if (!index.articles || !Array.isArray(index.articles)) {
        console.error('❌ FileAdapterLocal: Invalid index format:', index);
        this.articlesLoaded = true;
        return;
      }

      // Load each article from the index
      for (const articleInfo of index.articles) {
        try {
          const articlePath = `/articles/${articleInfo.category}/${articleInfo.filename}`;
          console.log('🔄 FileAdapterLocal: Trying to load:', articlePath);
          const response = await fetch(articlePath);

          if (response.ok) {
            const content = await response.text();
            console.log(`📥 FileAdapterLocal: Fetched content for ${articleInfo.filename} (${content.length} chars)`);
            this.parseAndAddArticle(content);
            console.log(`✅ FileAdapterLocal: Successfully loaded and parsed: ${articleInfo.filename}`);
          } else {
            console.error(`❌ FileAdapterLocal: Could not load article: ${articlePath} (Status: ${response.status})`);
          }
        } catch (error) {
          console.error(`❌ FileAdapterLocal: Error loading article ${articleInfo.filename}:`, error);
        }
      }

      this.articlesLoaded = true;
      console.log(`🎉 FileAdapterLocal: Article loading complete! Total articles: ${this.mockArticles.length}`);

      // Debug: List all loaded articles
      this.mockArticles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title} (${article.category}) [${article.id}]`);
      });

    } catch (error) {
      console.error('❌ FileAdapterLocal: Error loading articles index:', error);
      this.articlesLoaded = true;
    }
  }

  private parseAndAddArticle(content: string): void {
    try {
      console.log('🔄 FileAdapterLocal: Parsing article content...');
      const parsed = this.parseMarkdownFile(content);
      console.log('📋 FileAdapterLocal: Parsed article metadata:', parsed.metadata);

      if (parsed.metadata && parsed.content) {
        // Generate ID if not provided
        const id = parsed.metadata.id || `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const article: Article = {
          id,
          slug: parsed.metadata.slug || '',
          title: parsed.metadata.title || 'Untitled',
          content: parsed.content,
          description: parsed.metadata.description || '',
          category: parsed.metadata.category || 'general',
          tags: parsed.metadata.tags || [],
          previewImage: parsed.metadata.previewImage || '',
          date: parsed.metadata.date || new Date().toISOString().split('T')[0],
          readingTime: parsed.metadata.readingTime || 5,
          seo: parsed.metadata.seo || {
            metaTitle: parsed.metadata.title || '',
            metaDescription: parsed.metadata.description || '',
            canonical: `/${parsed.metadata.category}/${parsed.metadata.slug}`,
            ogImage: parsed.metadata.previewImage || '',
            twitterCard: 'summary_large_image' as const,
            keywords: []
          },
          seoScore: parsed.metadata.seoScore || 0,
          createdAt: parsed.metadata.createdAt ? new Date(parsed.metadata.createdAt) : new Date(),
          updatedAt: parsed.metadata.updatedAt ? new Date(parsed.metadata.updatedAt) : new Date()
        };

        // Add to mockArticles if not already exists
        const existingArticle = this.mockArticles.find(a => a.id === article.id);
        if (!existingArticle) {
          this.mockArticles.push(article);
          console.log(`➕ FileAdapterLocal: Added article to collection: "${article.title}" (ID: ${article.id})`);
          console.log(`📊 FileAdapterLocal: Total articles now: ${this.mockArticles.length}`);
        } else {
          console.log(`⚠️ FileAdapterLocal: Article already exists: ${article.id}`);
        }
      } else {
        console.error('❌ FileAdapterLocal: Failed to parse article - missing metadata or content');
        console.log('📝 FileAdapterLocal: Content preview:', content.substring(0, 200) + '...');
      }
    } catch (error) {
      console.error('❌ FileAdapterLocal: Error parsing article:', error);
      console.log('📝 FileAdapterLocal: Content that failed to parse:', content.substring(0, 200) + '...');
    }
  }



  async getArticles(): Promise<ArticleMetadata[]> {
    await this.ensureArticlesLoaded();

    // Log current articles for debugging
    console.log(`🔍 FileAdapterLocal.getArticles() called. Total articles: ${this.mockArticles.length}`);
    this.mockArticles.forEach(article => {
      console.log(`  - ${article.title} (${article.category}) [${article.id}]`);
    });

    // Return articles without content for listing
    return this.mockArticles.map(article => {
      const { content, ...metadata } = article;
      return metadata;
    });
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    await this.ensureArticlesLoaded();
    return this.mockArticles.find(article => article.slug === slug) || null;
  }

  async getArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
    await this.ensureArticlesLoaded();
    const filtered = this.mockArticles.filter(article => article.category === category);
    return filtered.map(article => {
      const { content, ...metadata } = article;
      return metadata;
    });
  }

  async getArticle(id: string): Promise<Article | null> {
    await this.ensureArticlesLoaded();
    return this.mockArticles.find(article => article.id === id) || null;
  }

  async saveArticle(article: Article): Promise<void> {
    const existingIndex = this.mockArticles.findIndex(a => a.id === article.id);
    if (existingIndex >= 0) {
      this.mockArticles[existingIndex] = article;
    } else {
      this.mockArticles.push(article);
    }
  }

  async addArticle(article: Article): Promise<void> {
    this.mockArticles.push(article);
  }

  async updateArticle(article: Article): Promise<void> {
    const existingIndex = this.mockArticles.findIndex(a => a.id === article.id);
    if (existingIndex >= 0) {
      this.mockArticles[existingIndex] = article;
    }
  }

  async deleteArticle(id: string): Promise<void> {
    this.mockArticles = this.mockArticles.filter(article => article.id !== id);
  }

  // Parse markdown content with frontmatter
  parseMarkdownFile(content: string): { metadata: Partial<Article>, content: string } {
    const parsed = matter(content);

    return {
      metadata: {
        id: parsed.data.id,
        slug: parsed.data.slug,
        title: parsed.data.title,
        date: parsed.data.date,
        category: parsed.data.category,
        description: parsed.data.description,
        previewImage: parsed.data.previewImage,
        tags: parsed.data.tags || [],
        readingTime: parsed.data.readingTime,
        seoScore: parsed.data.seoScore,
        seo: parsed.data.seo,
        createdAt: parsed.data.createdAt,
        updatedAt: parsed.data.updatedAt
      },
      content: parsed.content
    };
  }

  // Generate markdown with frontmatter
  generateMarkdownFile(article: Article): string {
    const frontmatter = {
      title: article.title,
      date: article.date,
      category: article.category,
      previewImage: article.previewImage,
      tags: article.tags,
    };

    return matter.stringify(article.content, frontmatter);
  }
}