import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage, ArticlePage, ArticlesPage, SearchPage, AdminPage } from './pages';
import { DebugPage } from './pages/DebugPage';
import { ImageDemoPage } from './pages/ImageDemoPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  const handleSearch = (query: string) => {
    // Navigate to search page with query
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header onSearch={handleSearch} />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/image-demo" element={<ImageDemoPage />} />
              {/* Old category routes for backward compatibility */}
              <Route path="/pregnancy" element={<HomePage category="pregnancy" />} />
              <Route path="/babies" element={<HomePage category="babies" />} />
              <Route path="/family" element={<HomePage category="family" />} />
              <Route path="/tips" element={<HomePage category="tips" />} />

              {/* New category routes */}
              <Route path="/aile-hayati" element={<HomePage category="aile-hayati" />} />
              <Route path="/bebekler" element={<HomePage category="bebekler" />} />
              <Route path="/hamilelik" element={<HomePage category="hamilelik" />} />
              <Route path="/okul-oncesi" element={<HomePage category="okul-oncesi" />} />
              <Route path="/ipuclari" element={<HomePage category="ipuclari" />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;