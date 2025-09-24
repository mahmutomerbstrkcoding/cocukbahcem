import { Article, SeoMetadata } from '@/domain';

export interface SeoAnalysisResult {
  score: number;
  suggestions: string[];
  details: {
    metaTitle: SeoCheckResult;
    metaDescription: SeoCheckResult;
    h1Tags: SeoCheckResult;
    imageAlts: SeoCheckResult;
    keywords: SeoCheckResult;
    contentLength: SeoCheckResult;
    structuredData: SeoCheckResult;
    canonicalAndOg: SeoCheckResult;
  };
}

export interface SeoCheckResult {
  score: number;
  maxScore: number;
  passed: boolean;
  message: string;
}

export class ValidateSeo {
  validate(article: Article): SeoAnalysisResult {
    const details = {
      metaTitle: this.checkMetaTitle(article.seo.metaTitle),
      metaDescription: this.checkMetaDescription(article.seo.metaDescription),
      h1Tags: this.checkH1Tags(article.content),
      imageAlts: this.checkImageAlts(article.content),
      keywords: this.checkKeywords(article.seo, article.title, article.description),
      contentLength: this.checkContentLength(article.content),
      structuredData: this.checkStructuredData(article.seo),
      canonicalAndOg: this.checkCanonicalAndOg(article.seo)
    };

    const totalScore = Object.values(details).reduce((sum, check) => sum + check.score, 0);
    const suggestions = this.generateSuggestions(details);

    return {
      score: Math.round(totalScore),
      suggestions,
      details
    };
  }

  private checkMetaTitle(metaTitle: string): SeoCheckResult {
    const length = metaTitle.length;
    const maxScore = 15;

    if (length >= 30 && length <= 60) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: `Meta title uzunluğu ideal (${length} karakter)`
      };
    } else if (length >= 20 && length <= 70) {
      return {
        score: Math.round(maxScore * 0.7),
        maxScore,
        passed: false,
        message: `Meta title uzunluğu kabul edilebilir (${length} karakter). İdeal: 30-60 karakter`
      };
    } else {
      return {
        score: 0,
        maxScore,
        passed: false,
        message: `Meta title çok ${length < 30 ? 'kısa' : 'uzun'} (${length} karakter). İdeal: 30-60 karakter`
      };
    }
  }

  private checkMetaDescription(metaDescription: string): SeoCheckResult {
    const length = metaDescription.length;
    const maxScore = 15;

    if (length >= 120 && length <= 160) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: `Meta description uzunluğu ideal (${length} karakter)`
      };
    } else if (length >= 100 && length <= 180) {
      return {
        score: Math.round(maxScore * 0.7),
        maxScore,
        passed: false,
        message: `Meta description uzunluğu kabul edilebilir (${length} karakter). İdeal: 120-160 karakter`
      };
    } else {
      return {
        score: 0,
        maxScore,
        passed: false,
        message: `Meta description çok ${length < 120 ? 'kısa' : 'uzun'} (${length} karakter). İdeal: 120-160 karakter`
      };
    }
  }

  private checkH1Tags(content: string): SeoCheckResult {
    const h1Matches = content.match(/^#\s+.+$/gm) || [];
    const maxScore = 10;

    if (h1Matches.length === 1) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: 'Tek H1 başlığı mevcut (ideal)'
      };
    } else if (h1Matches.length > 1) {
      return {
        score: Math.round(maxScore * 0.5),
        maxScore,
        passed: false,
        message: `${h1Matches.length} adet H1 başlığı bulundu. Tek H1 kullanılmalı`
      };
    } else {
      return {
        score: 0,
        maxScore,
        passed: false,
        message: 'H1 başlığı bulunamadı'
      };
    }
  }

  private checkImageAlts(content: string): SeoCheckResult {
    const imageMatches = content.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
    const maxScore = 10;

    if (imageMatches.length === 0) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: 'Görsel bulunmuyor'
      };
    }

    const imagesWithoutAlt = imageMatches.filter(img => {
      const altMatch = img.match(/!\[([^\]]*)\]/);
      return !altMatch || !altMatch[1] || altMatch[1].trim().length === 0;
    });

    if (imagesWithoutAlt.length === 0) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: `Tüm görsellerde alt metni mevcut (${imageMatches.length} görsel)`
      };
    } else {
      const score = Math.round(maxScore * (1 - imagesWithoutAlt.length / imageMatches.length));
      return {
        score,
        maxScore,
        passed: false,
        message: `${imagesWithoutAlt.length}/${imageMatches.length} görselde alt metni eksik`
      };
    }
  }

  private checkKeywords(seo: SeoMetadata, title: string, description: string): SeoCheckResult {
    const maxScore = 15;
    const keywords = seo.keywords;

    if (keywords.length === 0) {
      return {
        score: 0,
        maxScore,
        passed: false,
        message: 'Hiç keyword tanımlanmamış'
      };
    }

    const titleText = title.toLowerCase();
    const descText = description.toLowerCase();

    const keywordsInTitle = keywords.filter(keyword =>
      titleText.includes(keyword.toLowerCase())
    );

    const keywordsInDesc = keywords.filter(keyword =>
      descText.includes(keyword.toLowerCase())
    );

    let score = 0;
    let message = '';

    if (keywordsInTitle.length > 0 && keywordsInDesc.length > 0) {
      score = maxScore;
      message = `Keywords başlık ve açıklamada mevcut (${keywordsInTitle.length}/${keywords.length} başlıkta, ${keywordsInDesc.length}/${keywords.length} açıklamada)`;
    } else if (keywordsInTitle.length > 0) {
      score = Math.round(maxScore * 0.7);
      message = `Keywords sadece başlıkta mevcut (${keywordsInTitle.length}/${keywords.length})`;
    } else if (keywordsInDesc.length > 0) {
      score = Math.round(maxScore * 0.5);
      message = `Keywords sadece açıklamada mevcut (${keywordsInDesc.length}/${keywords.length})`;
    } else {
      score = 0;
      message = 'Keywords başlık veya açıklamada geçmiyor';
    }

    return {
      score,
      maxScore,
      passed: score === maxScore,
      message
    };
  }

  private checkContentLength(content: string): SeoCheckResult {
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
    const maxScore = 10;

    if (wordCount >= 400) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: `İçerik uzunluğu ideal (${wordCount} kelime)`
      };
    } else if (wordCount >= 200) {
      return {
        score: Math.round(maxScore * 0.5),
        maxScore,
        passed: false,
        message: `İçerik kısa (${wordCount} kelime). En az 400 kelime önerilir`
      };
    } else {
      return {
        score: 0,
        maxScore,
        passed: false,
        message: `İçerik çok kısa (${wordCount} kelime). En az 400 kelime gerekli`
      };
    }
  }

  private checkStructuredData(seo: SeoMetadata): SeoCheckResult {
    const maxScore = 10;

    // Basic check for structured data elements
    if (seo.ogImage && seo.canonical) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: 'Temel structured data mevcut'
      };
    } else {
      return {
        score: Math.round(maxScore * 0.5),
        maxScore,
        passed: false,
        message: 'Structured data eksik. JSON-LD eklenmeli'
      };
    }
  }

  private checkCanonicalAndOg(seo: SeoMetadata): SeoCheckResult {
    const maxScore = 10;
    const hasCanonical = seo.canonical && seo.canonical.length > 0;
    const hasOgImage = seo.ogImage && seo.ogImage.length > 0;

    if (hasCanonical && hasOgImage) {
      return {
        score: maxScore,
        maxScore,
        passed: true,
        message: 'Canonical URL ve OG image mevcut'
      };
    } else if (hasCanonical || hasOgImage) {
      return {
        score: Math.round(maxScore * 0.5),
        maxScore,
        passed: false,
        message: `${hasCanonical ? 'Canonical URL' : 'OG image'} mevcut, ${hasCanonical ? 'OG image' : 'Canonical URL'} eksik`
      };
    } else {
      return {
        score: 0,
        maxScore,
        passed: false,
        message: 'Canonical URL ve OG image eksik'
      };
    }
  }

  private generateSuggestions(details: SeoAnalysisResult['details']): string[] {
    const suggestions: string[] = [];

    Object.entries(details).forEach(([key, result]) => {
      if (!result.passed) {
        switch (key) {
          case 'metaTitle':
            suggestions.push(`Meta title'ı 30-60 karakter arasında tutun`);
            break;
          case 'metaDescription':
            suggestions.push(`Meta description'ı 120-160 karakter arasında tutun`);
            break;
          case 'h1Tags':
            suggestions.push(`Sadece bir H1 başlığı kullanın`);
            break;
          case 'imageAlts':
            suggestions.push(`Tüm görsellere alt metni ekleyin`);
            break;
          case 'keywords':
            suggestions.push(`Keywords'leri başlık ve açıklamada kullanın`);
            break;
          case 'contentLength':
            suggestions.push(`İçeriği en az 400 kelime yapın`);
            break;
          case 'structuredData':
            suggestions.push(`JSON-LD structured data ekleyin`);
            break;
          case 'canonicalAndOg':
            suggestions.push(`Canonical URL ve OG image tanımlayın`);
            break;
        }
      }
    });

    return suggestions;
  }
}