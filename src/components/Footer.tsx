import React from 'react';
import { Baby, Heart, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Hamilelik', href: '/pregnancy' },
    { name: 'Bebekler', href: '/babies' },
    { name: 'Aile', href: '/family' },
    { name: 'İpuçları', href: '/tips' },
  ];

  const quickLinks = [
    { name: 'Hakkımızda', href: '/about' },
    { name: 'İletişim', href: '/contact' },
    { name: 'Gizlilik Politikası', href: '/privacy' },
    { name: 'Kullanım Şartları', href: '/terms' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-semibold">
                Çocuk Bahçem
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Anne ve bebek sağlığı, hamilelik, bebek bakımı ve aile yaşamı hakkında
              güvenilir bilgiler ve pratik öneriler paylaşıyoruz.
            </p>
            <div className="flex items-center space-x-1 text-primary-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Sevgiyle hazırlanmıştır</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-300">E-posta</p>
                <a
                  href="mailto:info@cocukbahcem.com"
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  info@cocukbahcem.com
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-300">Telefon</p>
                <a
                  href="tel:+905555555555"
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  +90 555 555 55 55
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-300">Adres</p>
                <p className="text-white">İstanbul, Türkiye</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Çocuk Bahçem. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Bu site anne ve bebek sağlığı konularında bilgilendirme amaçlıdır.
            Herhangi bir sağlık problemi için mutlaka uzman doktor görüşü alınmalıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};