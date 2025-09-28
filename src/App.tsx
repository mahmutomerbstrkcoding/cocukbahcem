import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage, ArticlePage, ArticlesPage, AdminPage } from './pages';
import { DebugPage } from './pages/DebugPage';
import { ImageDemoPage } from './pages/ImageDemoPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
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
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/image-demo" element={<ImageDemoPage />} />
              <Route path="/pregnancy" element={<HomePage category="pregnancy" />} />
              <Route path="/babies" element={<HomePage category="babies" />} />
              <Route path="/family" element={<HomePage category="family" />} />
              <Route path="/tips" element={<HomePage category="tips" />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;