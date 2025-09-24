import { Article } from '@/domain';
import { FileAdapterLocal } from '@/infrastructure';
import { ValidateSeo } from './ValidateSeo';

export interface CreateArticleInput {
  title: string;
  content: string;
  category: string;
  previewImage: string;
  description: string;
  tags: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonical: string;
    ogImage: string;
    keywords: string[];
  };
}

export class CreateArticle {
  constructor(
    private fileAdapter: FileAdapterLocal,
    private seoValidator: ValidateSeo
  ) {}

  async execute(input: CreateArticleInput): Promise<Article> {
    // Generate article metadata
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const slug = this.generateSlug(input.title, dateStr);

    // Calculate reading time (average 200 words per minute)
    const readingTime = this.calculateReadingTime(input.content);

    // Create article
    const article: Article = {
      id: this.generateId(),
      slug,
      title: input.title,
      date: dateStr,
      category: input.category,
      previewImage: input.previewImage,
      description: input.description,
      content: input.content,
      tags: input.tags,
      readingTime,
      seo: {
        metaTitle: input.seo.metaTitle,
        metaDescription: input.seo.metaDescription,
        canonical: input.seo.canonical,
        ogImage: input.seo.ogImage,
        twitterCard: 'summary_large_image',
        keywords: input.seo.keywords
      },
      createdAt: now,
      updatedAt: now
    };

    // Validate SEO and set score
    const seoAnalysis = this.seoValidator.validate(article);
    article.seoScore = seoAnalysis.score;

    // Save article
    await this.fileAdapter.saveArticle(article);

    return article;
  }

  private generateSlug(title: string, date: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[çğıöşü]/g, match => {
        const turkishChars: { [key: string]: string } = {
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
        };
        return turkishChars[match] || match;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    return `${date}-${slug}`;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  private calculateReadingTime(content: string): number {
    // Remove markdown syntax for word count
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1'); // Remove inline code

    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    const wordsPerMinute = 200;

    return Math.max(1, Math.round(wordCount / wordsPerMinute));
  }
}