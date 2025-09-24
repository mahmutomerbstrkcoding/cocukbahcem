export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  keywords: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  previewImage: string;
  description: string;
  content: string;
  tags: string[];
  readingTime: number;
  seo: SeoMetadata;
  seoScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleMetadata extends Omit<Article, 'content'> {
  // Metadata without the full content
}