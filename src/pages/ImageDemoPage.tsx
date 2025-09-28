import React from 'react';
import { ArticleImage } from '@/components/ArticleImage';

export const ImageDemoPage: React.FC = () => {
  const imageExamples = [
    {
      title: 'External URL (Unsplash)',
      src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&auto=format',
      category: 'babies',
      description: 'High quality external image from Unsplash'
    },
    {
      title: 'Local Image (Exists)',
      src: '/assets/images/family-time.jpg',
      category: 'family',
      description: 'Local image that should exist in assets folder'
    },
    {
      title: 'Local Image (Missing)',
      src: '/assets/images/missing-image.jpg',
      category: 'pregnancy',
      description: 'Local image that does not exist - should fallback to category placeholder'
    },
    {
      title: 'Relative Path',
      src: 'pregnancy-nutrition.jpg',
      category: 'pregnancy',
      description: 'Relative path that gets resolved to /assets/images/'
    },
    {
      title: 'No Image (Empty)',
      src: '',
      category: 'tips',
      description: 'Empty image - should show category placeholder'
    },
    {
      title: 'Invalid URL',
      src: 'https://invalid-domain-that-does-not-exist.com/image.jpg',
      category: 'babies',
      description: 'Invalid external URL - should fallback to category placeholder'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🖼️ Image System Demo</h1>

      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Image System Features:</h2>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>🌐 <strong>External URLs:</strong> Fully qualified URLs (http/https) are used as-is</li>
          <li>📁 <strong>Local Images:</strong> Paths starting with / are used directly</li>
          <li>🔧 <strong>Relative Paths:</strong> Images without / get prefixed with /assets/images/</li>
          <li>🎨 <strong>Category Placeholders:</strong> Beautiful fallback images for each category</li>
          <li>⚡ <strong>Loading States:</strong> Smooth loading animations</li>
          <li>🛡️ <strong>Error Handling:</strong> Graceful fallbacks when images fail to load</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imageExamples.map((example, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{example.description}</p>

            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <ArticleImage
                src={example.src}
                alt={example.title}
                category={example.category}
                className="w-full h-full"
              />
            </div>

            <div className="text-xs text-gray-500 break-all">
              <strong>Source:</strong> {example.src || '(empty)'}
            </div>
            <div className="text-xs text-gray-500">
              <strong>Category:</strong> {example.category}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800 mb-2">How to Use:</h2>
        <div className="text-green-700 space-y-2">
          <p><strong>External Images:</strong> Use full URLs like <code>https://images.unsplash.com/...</code></p>
          <p><strong>Local Images:</strong> Place in <code>/public/assets/images/</code> and reference as <code>/assets/images/filename.jpg</code></p>
          <p><strong>Quick Local:</strong> Just use filename like <code>image.jpg</code> (auto-prefixed)</p>
          <p><strong>No Image:</strong> Leave empty or omit - automatic category-based placeholder will be used</p>
        </div>
      </div>
    </div>
  );
};