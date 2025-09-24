import React from 'react';
import { Home, Baby, Heart, Lightbulb, Menu, X, Search } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories = [
    { id: 'pregnancy', label: 'Hamilelik', icon: Heart, path: '/pregnancy' },
    { id: 'babies', label: 'Bebekler', icon: Baby, path: '/babies' },
    { id: 'family', label: 'Aile', icon: Home, path: '/family' },
    { id: 'tips', label: 'İpuçları', icon: Lightbulb, path: '/tips' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-semibold text-gray-900">
                Çocuk Bahçem
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <a
                  key={category.id}
                  href={category.path}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.label}</span>
                </a>
              );
            })}
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
            <button className="sm:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg">
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <a
                    key={category.id}
                    href={category.path}
                    className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{category.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4 pt-4 border-t border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};