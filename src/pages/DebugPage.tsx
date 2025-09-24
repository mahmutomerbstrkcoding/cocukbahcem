import React, { useState, useEffect } from 'react';
import { FileAdapterLocal, GetArticleMetadata } from '@/infrastructure';
import { ArticleMetadata } from '@/domain';

export const DebugPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp} - ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    testArticleLoading();
  }, []);

  const testArticleLoading = async () => {
    try {
      setLoading(true);
      addLog('🚀 Starting article loading test...');

      // Test FileAdapter
      addLog('🔧 Getting FileAdapter instance...');
      const fileAdapter = FileAdapterLocal.getInstance();
      addLog('✅ FileAdapter instance created');

      // Test GetArticleMetadata
      addLog('📋 Creating GetArticleMetadata...');
      const getArticleMetadata = new GetArticleMetadata(fileAdapter);
      addLog('✅ GetArticleMetadata created');

      // Test direct fileAdapter call
      addLog('📄 Calling fileAdapter.getArticles() directly...');
      const directArticles = await fileAdapter.getArticles();
      addLog(`📊 Direct call returned ${directArticles.length} articles`);

      // Test through use case
      addLog('🔍 Calling getArticleMetadata.getAll()...');
      const useCaseArticles = await getArticleMetadata.getAll();
      addLog(`📊 Use case returned ${useCaseArticles.length} articles`);

      // Test featured articles
      addLog('⭐ Calling getArticleMetadata.getFeatured()...');
      const featuredArticles = await getArticleMetadata.getFeatured(3);
      addLog(`⭐ Featured returned ${featuredArticles.length} articles`);

      setArticles(useCaseArticles);
      addLog('🎉 Test completed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Article Loading Debug</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {loading && <div className="animate-pulse">⏳ Loading...</div>}
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">📚 Loaded Articles ({articles.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {articles.length === 0 ? (
              <div className="text-gray-500 italic">No articles loaded</div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                  <div className="font-semibold text-gray-800">{article.title}</div>
                  <div className="text-sm text-gray-600">
                    Category: {article.category} | ID: {article.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    Date: {article.date} | SEO Score: {article.seoScore}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={testArticleLoading}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-semibold"
        >
          {loading ? '⏳ Testing...' : '🔄 Run Test Again'}
        </button>
      </div>
    </div>
  );
};