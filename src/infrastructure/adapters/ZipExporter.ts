import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Article } from '@/domain';

export interface ExportBundle {
  article: Article;
  files: {
    markdown: string;
    metadata: string;
    images?: string[];
  };
}

export class ZipExporter {
  async exportArticle(article: Article): Promise<void> {
    const zip = new JSZip();

    // Create folder for the article
    const articleFolder = zip.folder(article.slug);

    if (!articleFolder) {
      throw new Error('Failed to create article folder in zip');
    }

    // Generate markdown content with frontmatter
    const markdownContent = this.generateMarkdownContent(article);
    articleFolder.file('article.md', markdownContent);

    // Generate metadata JSON
    const metadataJson = this.generateMetadataJson(article);
    articleFolder.file('meta.json', JSON.stringify(metadataJson, null, 2));

    // Add README with instructions
    const readme = this.generateReadme(article);
    articleFolder.file('README.md', readme);

    // Generate zip and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const fileName = `${article.slug}-export.zip`;

    saveAs(zipBlob, fileName);
  }

  async exportMultipleArticles(articles: Article[]): Promise<void> {
    const zip = new JSZip();

    for (const article of articles) {
      const articleFolder = zip.folder(article.slug);

      if (articleFolder) {
        const markdownContent = this.generateMarkdownContent(article);
        articleFolder.file('article.md', markdownContent);

        const metadataJson = this.generateMetadataJson(article);
        articleFolder.file('meta.json', JSON.stringify(metadataJson, null, 2));
      }
    }

    // Add global README
    const globalReadme = this.generateGlobalReadme(articles);
    zip.file('README.md', globalReadme);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const fileName = `cocuk-bahcem-articles-${new Date().toISOString().split('T')[0]}.zip`;

    saveAs(zipBlob, fileName);
  }

  private generateMarkdownContent(article: Article): string {
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

  private generateMetadataJson(article: Article) {
    return {
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
  }

  private generateReadme(article: Article): string {
    return `# ${article.title}

Bu klasör Çocuk Bahçem admin panelinden export edilmiştir.

## Dosyalar

- \`article.md\`: Makale içeriği (Markdown formatında)
- \`meta.json\`: SEO metadata ve makale bilgileri
- \`README.md\`: Bu dosya

## Kurulum

1. \`article.md\` dosyasını projenizin \`articles/${article.category}/\` klasörüne kopyalayın
2. \`meta.json\` dosyasını \`seo-json/\` klasörüne kopyalayın
3. Gerekirse görsel dosyalarını \`public/assets/images/\` klasörüne ekleyin

## Makale Bilgileri

- **Kategori**: ${article.category}
- **Tarih**: ${article.date}
- **SEO Skoru**: ${article.seoScore}/100
- **Okuma Süresi**: ${article.readingTime} dakika
- **Etiketler**: ${article.tags.join(', ')}

## SEO Bilgileri

- **Meta Title**: ${article.seo.metaTitle}
- **Meta Description**: ${article.seo.metaDescription}
- **Canonical URL**: ${article.seo.canonical}
- **Keywords**: ${article.seo.keywords.join(', ')}
`;
  }

  private generateGlobalReadme(articles: Article[]): string {
    const articleList = articles.map(article =>
      `- **${article.title}** (${article.category}) - SEO: ${article.seoScore}/100`
    ).join('\n');

    return `# Çocuk Bahçem - Article Export

Bu ZIP dosyası ${articles.length} makale içermektedir.

## Export Bilgileri

- **Export Tarihi**: ${new Date().toLocaleString('tr-TR')}
- **Toplam Makale**: ${articles.length}

## Makaleler

${articleList}

## Kurulum Talimatları

1. Her makale klasörünü projenizin \`articles/\` dizinindeki ilgili kategori klasörüne kopyalayın
2. Meta JSON dosyalarını \`seo-json/\` klasörüne yerleştirin
3. Gerekli görsel dosyalarını \`public/assets/images/\` klasörüne ekleyin

## Yapı

\`\`\`
articles/
├─ pregnancy/
│  └─ article.md
├─ babies/
│  └─ article.md
└─ family/
   └─ article.md
\`\`\`
`;
  }
}