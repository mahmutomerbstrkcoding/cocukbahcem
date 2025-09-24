import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage, ArticlePage, AdminPage } from './pages';
import { DebugPage } from './pages/DebugPage';
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
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/debug" element={<DebugPage />} />
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