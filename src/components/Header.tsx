import React from 'react';
import { Home, Baby, Heart, Lightbulb, Menu, X, Search } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories = [
    { id: 'ana-sayfa', label: 'Ana Sayfa', icon: Home, path: '/' },
    { id: 'aile-hayati', label: 'Aile', icon: Heart, path: '/aile-hayati' },
    { id: 'bebekler', label: 'Bebekler', icon: Baby, path: '/bebekler' },
    { id: 'hamilelik', label: 'Hamilelik', icon: Heart, path: '/hamilelik' },
    { id: 'okul-oncesi', label: 'Okul Öncesi', icon: Lightbulb, path: '/okul-oncesi' },
    { id: 'ipuclari', label: 'İpuçları', icon: Lightbulb, path: '/ipuclari' },
    { id: 'iletisim', label: 'İletişim', icon: Home, path: '/iletisim' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-gradient-to-r from-[#f7b2bd] to-[#a8d8ea] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <img
                src="/assets/images/cocukbahcem2.png"
                alt="Çocuk Bahçem Logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-display font-semibold text-white">
                Çocuk Bahçem
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5">
            {categories.map((category) => (
              <a
                key={category.id}
                href={category.path}
                className="flex items-center text-white/90 hover:text-white transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-white/10"
              >
                <span className="font-medium text-xs whitespace-nowrap">{category.label}</span>
              </a>
            ))}
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </form>

            {/* Mobile Search Icon */}
            <button className="sm:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg">
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={category.path}
                  className="flex items-center space-x-3 px-3 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-medium">{category.label}</span>
                </a>
              ))}
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4 pt-4 border-t border-white/20">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white text-white placeholder-white/70"
                />
                <Search className="w-4 h-4 text-white/70 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};