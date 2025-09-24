import { Article } from '@/domain';
import { ZipExporter } from '@/infrastructure';

export interface ExportOptions {
  includeImages?: boolean;
  format?: 'zip' | 'json';
}

export class ExportArticleBundle {
  constructor(private zipExporter: ZipExporter) {}

  async exportSingle(article: Article, _options: ExportOptions = {}): Promise<void> {
    try {
      await this.zipExporter.exportArticle(article);
    } catch (error) {
      throw new Error(`Failed to export article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportMultiple(articles: Article[], _options: ExportOptions = {}): Promise<void> {
    if (articles.length === 0) {
      throw new Error('No articles to export');
    }

    try {
      await this.zipExporter.exportMultipleArticles(articles);
    } catch (error) {
      throw new Error(`Failed to export articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportByCategory(articles: Article[], category: string): Promise<void> {
    const categoryArticles = articles.filter(article => article.category === category);

    if (categoryArticles.length === 0) {
      throw new Error(`No articles found in category: ${category}`);
    }

    await this.exportMultiple(categoryArticles);
  }

  generateMetadataJson(article: Article): string {
    const metadata = {
      slug: article.slug,
      title: article.title,
      date: article.date,
      category: article.category,
      previewImage: article.previewImage,
      description: article.description,
      tags: article.tags,
      readingTime: article.readingTime,
      seo: article.seo,
      seoScore: article.seoScore,
    };

    return JSON.stringify(metadata, null, 2);
  }

  generateMarkdownContent(article: Article): string {
    const frontmatter = `---
title: "${article.title}"
date: ${article.date}
category: ${article.category}
previewImage: ${article.previewImage}
tags: [${article.tags.map(tag => `"${tag}"`).join(', ')}]
description: "${article.description}"
---

`;

    return frontmatter + article.content;
  }

  copyMetadataToClipboard(article: Article): Promise<void> {
    return new Promise((resolve, reject) => {
      const metadata = this.generateMetadataJson(article);

      if (navigator.clipboard) {
        navigator.clipboard.writeText(metadata)
          .then(() => resolve())
          .catch(reject);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = metadata;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          textArea.remove();
          resolve();
        } catch (err) {
          textArea.remove();
          reject(err);
        }
      }
    });
  }

  validateExportData(article: Article): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!article.title || article.title.trim().length === 0) {
      errors.push('Article title is required');
    }

    if (!article.content || article.content.trim().length === 0) {
      errors.push('Article content is required');
    }

    if (!article.category || article.category.trim().length === 0) {
      errors.push('Article category is required');
    }

    if (!article.seo.metaTitle || article.seo.metaTitle.trim().length === 0) {
      errors.push('Meta title is required');
    }

    if (!article.seo.metaDescription || article.seo.metaDescription.trim().length === 0) {
      errors.push('Meta description is required');
    }

    if (!article.slug || article.slug.trim().length === 0) {
      errors.push('Article slug is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}