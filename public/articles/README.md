# 📁 Articles Folder Structure

This folder contains all the blog articles for Çocuk Bahçem. Each article is stored as a Markdown file with frontmatter metadata.

## 📂 Folder Structure

```
public/articles/
├── index.json         # Article index (MUST be updated)
├── pregnancy/         # Hamilelik kategorisi
├── babies/           # Bebekler kategorisi
├── family/           # Aile kategorisi
├── tips/             # İpuçları kategorisi
└── README.md         # This file
```

## 📋 Article Index (index.json)

The `index.json` file contains a list of all articles and MUST be updated when adding new articles:

```json
{
  "articles": [
    {
      "category": "pregnancy",
      "filename": "2025-09-01-hamilelikte-beslenme.md"
    },
    {
      "category": "babies",
      "filename": "2025-09-15-bebek-uyku-duzeni.md"
    }
  ]
}
```

**⚠️ Important**: Without updating this file, your articles won't appear in the app!## 📝 Article File Format

Each article should be named with the following format:
```
YYYY-MM-DD-article-slug.md
```

For example:
- `2025-09-01-hamilelikte-beslenme.md`
- `2025-09-15-bebek-uyku-duzeni.md`

## 🏷️ Article Structure

Each article file must include frontmatter metadata at the top:

```yaml
---
id: unique-article-id
title: "Article Title"
date: 2025-09-01
category: pregnancy
slug: article-url-slug
description: "Brief description of the article"
previewImage: "/assets/images/article-image.jpg"
tags: ["tag1", "tag2", "tag3"]
readingTime: 8
seoScore: 100
seo:
  metaTitle: "SEO optimized title"
  metaDescription: "SEO meta description"
  canonical: "/category/article-slug"
  ogImage: "/assets/images/article-image.jpg"
  twitterCard: "summary_large_image"
  keywords: ["keyword1", "keyword2"]
relatedArticles: ["other-article-id-1", "other-article-id-2"]
createdAt: 2025-09-01T00:00:00.000Z
updatedAt: 2025-09-01T00:00:00.000Z
---

# Article Content in Markdown

Your article content goes here...
```

## 🚀 How to Add New Articles

### Option 1: Using Admin Panel (Recommended)
1. Go to `/admin` and login
2. Click "Yeni Makale Ekle"
3. Fill in all required fields
4. Make sure SEO score reaches 100/100
5. Click "Yayınla"
6. The system will download the article file
7. Save the downloaded file to the appropriate category folder in `public/articles/`
8. **IMPORTANT**: Update `public/articles/index.json` and add your article info:
   ```json
   {
     "category": "your-category",
     "filename": "YYYY-MM-DD-your-article-slug.md"
   }
   ```
9. Refresh the page to see your article### Option 2: Manual Creation
1. Create a new `.md` file in the appropriate category folder
2. Follow the frontmatter structure above
3. Write your content in Markdown format
4. Refresh the application to load the new article

## 📋 Categories

- **pregnancy**: Hamilelik ile ilgili makaleler
- **babies**: Bebek bakımı ve gelişimi
- **family**: Aile yaşamı ve ebeveynlik
- **tips**: Pratik ipuçları ve öneriler

## ✅ Best Practices

1. **SEO Optimization**: Always aim for 100/100 SEO score
2. **Images**: Store images in `/public/assets/images/`
3. **File Naming**: Use consistent date-slug naming convention
4. **Content Quality**: Minimum 1000 characters for good SEO
5. **Markdown**: Use proper headings (##, ###) and formatting
6. **Links**: Include relevant internal and external links

## 🔄 Loading Process

1. Articles are automatically loaded from these folders on app start
2. The system parses frontmatter and markdown content
3. Articles appear on homepage and category pages
4. Changes require a page refresh or server restart

## 🐛 Troubleshooting

If your article doesn't appear:
1. Check the file is in the correct category folder
2. Verify frontmatter syntax is correct
3. Ensure required fields are not empty
4. Refresh the page or restart the server
5. Check browser console for any errors

## 📚 Example Articles

See the example articles in this folder for reference:
- `pregnancy/2025-09-01-hamilelikte-beslenme.md`
- `babies/2025-09-15-bebek-uyku-duzeni.md`