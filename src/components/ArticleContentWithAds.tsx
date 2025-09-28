import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { ResponsiveAdBanner } from './AdBanner';
import { getAdSlot } from '../config/adsConfig';

interface ArticleContentWithAdsProps {
  content: string;
  afterParagraph: number;
}

export const ArticleContentWithAds: React.FC<ArticleContentWithAdsProps> = ({
  content,
  afterParagraph,
}) => {
  const contentParts = useMemo(() => {
    // Split content by double newlines (paragraphs)
    const paragraphs = content.split('\n\n');
    const parts: (string | 'AD')[] = [];

    paragraphs.forEach((paragraph, index) => {
      parts.push(paragraph);

      // Insert ad after the specified paragraph
      if (index === afterParagraph - 1 && index < paragraphs.length - 1) {
        parts.push('AD');
      }
    });

    return parts;
  }, [content, afterParagraph]);

  return (
    <div className="article-content-with-ads">
      {contentParts.map((part, index) => {
        if (part === 'AD') {
          return (
            <div key={`ad-${index}`} className="my-8">
              <ResponsiveAdBanner adSlot={getAdSlot('articleMiddle')} />
            </div>
          );
        }

        return (
          <div key={`content-${index}`} className="prose-section">
            <ReactMarkdown
              rehypePlugins={[rehypeSanitize]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mt-8 mb-4 break-words">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 mt-6 mb-3 break-words">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-4 mb-2 break-words">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4 break-words overflow-wrap-anywhere">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 break-words">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 break-words">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="break-words overflow-wrap-anywhere">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 my-6 break-words">
                    {children}
                  </blockquote>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="rounded-lg shadow-sm my-6 w-full max-w-full"
                    loading="lazy"
                  />
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary-600 hover:text-primary-700 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm break-all">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto break-all">
                    {children}
                  </pre>
                ),
              }}
            >
              {part}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
};