import React, { useState } from 'react';
import { adsConfig, AdsConfig, saveAdsConfig } from '../../config/adsConfig';
import { AdsManager } from '../../utils/adsManager';
import { Settings, Eye, EyeOff, Save, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { SmartAd } from '../SmartAd';

export const AdsConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<AdsConfig>(adsConfig);
  const [isModified, setIsModified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [adsManager] = useState(() => AdsManager.getInstance());
  const [displayStats, setDisplayStats] = useState(() => adsManager.getDisplayStats());

  const handleToggleAds = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    setIsModified(true);

    // Update the global config immediately for preview
    adsConfig.enabled = newConfig.enabled;
    // Notify components of the change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adsConfigChanged'));
    }
  };

  const handleClientIdChange = (value: string) => {
    const newConfig = { ...config, googleAdsenseClientId: value };
    setConfig(newConfig);
    setIsModified(true);
  };

  const handleAdSlotChange = (slot: keyof AdsConfig['adSlots'], value: string) => {
    const newConfig = {
      ...config,
      adSlots: { ...config.adSlots, [slot]: value }
    };
    setConfig(newConfig);
    setIsModified(true);
  };

  const handlePlacementChange = (
    device: 'mobile' | 'desktop' | 'frequency',
    setting: string,
    value: boolean | number
  ) => {
    if (device === 'frequency') {
      const newConfig = {
        ...config,
        frequency: {
          ...config.frequency,
          [setting]: value
        }
      };
      setConfig(newConfig);
      setIsModified(true);
    } else {
      const newConfig = {
        ...config,
        placements: {
          ...config.placements,
          [device]: {
            ...config.placements[device],
            [setting]: value
          }
        }
      };
      setConfig(newConfig);
      setIsModified(true);
    }
  };

  const handleSave = () => {
    // Update the global config
    Object.assign(adsConfig, config);

    // Save to localStorage (this will also dispatch the event)
    saveAdsConfig();

    // Update ads manager with new config
    adsManager.updateConfig(config);

    setIsModified(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    setConfig(adsConfig);
    setIsModified(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Google Ads Yapılandırması</h2>
        </div>

        {isModified && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Ayarlar başarıyla kaydedildi!</span>
        </div>
      )}

      {/* Master Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Google Ads Durumu
            </h3>
            <p className="text-gray-600">
              {config.enabled
                ? (config.debugMode
                    ? 'Örnek reklamlar gösteriliyor (Debug Modu)'
                    : 'Reklamlar aktif')
                : 'Tüm reklamlar gizli'
              }
            </p>
          </div>

          <button
            onClick={handleToggleAds}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              config.enabled
                ? (config.debugMode
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200')
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.enabled ? (
              config.debugMode ? (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Debug</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Aktif</span>
                </>
              )
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Pasif</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Debug Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Debug Modu
            </h3>
            <p className="text-gray-600">
              {config.debugMode
                ? 'Örnek reklamlar gösteriliyor (test amaçlı)'
                : 'Gerçek reklamlar veya placeholder gösteriliyor'
              }
            </p>
          </div>

          <button
            onClick={() => {
              const newConfig = { ...config, debugMode: !config.debugMode };
              setConfig(newConfig);
              setIsModified(true);
              // Update the global config immediately for preview
              adsConfig.debugMode = newConfig.debugMode;
              // Notify components of the change
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('adsConfigChanged'));
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              config.debugMode
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.debugMode ? (
              <>
                <Settings className="w-4 h-4" />
                <span>Aktif</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Pasif</span>
              </>
            )}
          </button>
        </div>

        {config.debugMode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800 text-sm font-medium">Debug Modu Aktif</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Tüm sayfalarda örnek reklamlar gösterilecek. Bu mod sadece test amaçlıdır.
            </p>
          </div>
        )}
      </div>

      {/* AdSense Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          AdSense Yapılandırması
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AdSense İstemci ID
            </label>
            <input
              type="text"
              value={config.googleAdsenseClientId || ''}
              onChange={(e) => handleClientIdChange(e.target.value)}
              placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Makale Üstü Reklam Slot ID
              </label>
              <input
                type="text"
                value={config.adSlots.articleTop}
                onChange={(e) => handleAdSlotChange('articleTop', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Makale Ortası Reklam Slot ID
              </label>
              <input
                type="text"
                value={config.adSlots.articleMiddle}
                onChange={(e) => handleAdSlotChange('articleMiddle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Makale Altı Reklam Slot ID
              </label>
              <input
                type="text"
                value={config.adSlots.articleBottom}
                onChange={(e) => handleAdSlotChange('articleBottom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sidebar Reklam Slot ID
              </label>
              <input
                type="text"
                value={config.adSlots.sidebar}
                onChange={(e) => handleAdSlotChange('sidebar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobil İçerik Arası Reklam Slot ID
              </label>
              <input
                type="text"
                value={config.adSlots.mobileInline}
                onChange={(e) => handleAdSlotChange('mobileInline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masaüstü Banner Reklam Slot ID
              </label>
              <input
                type="text"
                value={config.adSlots.desktopBanner}
                onChange={(e) => handleAdSlotChange('desktopBanner', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Placement Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📱 Mobil Reklam Yerleşimi
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Alt kısımda reklam göster</span>
            <input
              type="checkbox"
              checked={config.placements.mobile.showInFooter}
              onChange={(e) => handlePlacementChange('mobile', 'showInFooter', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">İçerik arası reklamları göster</span>
            <input
              type="checkbox"
              checked={config.placements.mobile.showInlineAds}
              onChange={(e) => handlePlacementChange('mobile', 'showInlineAds', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kaçıncı paragraftan sonra reklam göster
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.placements.mobile.showAfterParagraph}
                onChange={(e) => handlePlacementChange('mobile', 'showAfterParagraph', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayfa başına maksimum reklam sayısı
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.placements.mobile.maxAdsPerPage}
                onChange={(e) => handlePlacementChange('mobile', 'maxAdsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Placement Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🖥️ Masaüstü Reklam Yerleşimi
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Sidebar'da reklam göster</span>
            <input
              type="checkbox"
              checked={config.placements.desktop.showSidebar}
              onChange={(e) => handlePlacementChange('desktop', 'showSidebar', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Alt kısımda reklam göster</span>
            <input
              type="checkbox"
              checked={config.placements.desktop.showInFooter}
              onChange={(e) => handlePlacementChange('desktop', 'showInFooter', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Üst banner reklamı göster</span>
            <input
              type="checkbox"
              checked={config.placements.desktop.showBannerAd}
              onChange={(e) => handlePlacementChange('desktop', 'showBannerAd', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paragraf sonrası reklam
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.placements.desktop.showAfterParagraph}
                onChange={(e) => handlePlacementChange('desktop', 'showAfterParagraph', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sidebar reklam sayısı
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={config.placements.desktop.sidebarAdCount}
                onChange={(e) => handlePlacementChange('desktop', 'sidebarAdCount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum reklam/sayfa
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={config.placements.desktop.maxAdsPerPage}
                onChange={(e) => handlePlacementChange('desktop', 'maxAdsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frequency Control */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⏱️ Reklam Görüntüleme Sıklığı
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reklam göstermeden önce okunacak makale sayısı
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={config.frequency.articlesViewedBeforeAd}
              onChange={(e) => handlePlacementChange('frequency' as any, 'articlesViewedBeforeAd', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">0 = her makale açıldığında reklam göster</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aynı kullanıcıya reklam arası (dakika)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.frequency.adDisplayInterval}
              onChange={(e) => handlePlacementChange('frequency' as any, 'adDisplayInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Aynı kullanıcıya ne kadar aralıkla reklam gösterilsin</p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Reklam İstatistikleri
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setDisplayStats(adsManager.getDisplayStats())}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yenile</span>
            </button>
            <button
              onClick={() => {
                adsManager.resetState();
                setDisplayStats(adsManager.getDisplayStats());
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{displayStats.articlesViewed}</div>
            <div className="text-sm text-blue-600">Okunan Makale</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {displayStats.lastAdDisplayTime > 0
                ? Math.floor((Date.now() - displayStats.lastAdDisplayTime) / (1000 * 60))
                : '∞'
              }
            </div>
            <div className="text-sm text-green-600">Son Reklamdan Bu Yana (dk)</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {adsManager.shouldShowAds() ? '✓' : '✗'}
            </div>
            <div className="text-sm text-purple-600">Reklam Gösterim Durumu</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Not:</strong> Bu istatistikler localStorage'da saklanır ve tarayıcıya özeldir.
            Gerçek uygulamada bu veriler sunucuda tutulmalıdır.
          </p>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-600" />
          Reklam Yapılandırması Özeti
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Status */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${config.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                Reklamlar: <strong>{config.enabled ? 'Aktif' : 'Pasif'}</strong>
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>• {config.frequency.articlesViewedBeforeAd} makale sonrası reklam</p>
              <p>• {config.frequency.adDisplayInterval} dakika reklam arası</p>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-2">📱 Mobil Ayarları:</p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Maks. {config.placements.mobile.maxAdsPerPage} reklam/sayfa</li>
                <li>• {config.placements.mobile.showAfterParagraph}. paragraf sonrası</li>
                <li>• {config.placements.mobile.showInlineAds ? '✓' : '✗'} İçerik arası</li>
                <li>• {config.placements.mobile.showInFooter ? '✓' : '✗'} Alt kısım</li>
              </ul>
            </div>

            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-2">🖥️ Masaüstü Ayarları:</p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Maks. {config.placements.desktop.maxAdsPerPage} reklam/sayfa</li>
                <li>• {config.placements.desktop.showAfterParagraph}. paragraf sonrası</li>
                <li>• {config.placements.desktop.showBannerAd ? '✓' : '✗'} Üst banner</li>
                <li>• {config.placements.desktop.showSidebar ? '✓' : '✗'} Sidebar ({config.placements.desktop.sidebarAdCount} reklam)</li>
                <li>• {config.placements.desktop.showInFooter ? '✓' : '✗'} Alt kısım</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="mt-4 pt-4 border-t border-blue-200 flex flex-wrap gap-2">
          <button
            onClick={() => window.open('/', '_blank')}
            className="btn-primary text-sm flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Ana Sayfada Test Et</span>
          </button>

          <button
            onClick={() => window.open('/articles', '_blank')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center space-x-2 transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Makaleler</span>
          </button>

          <button
            onClick={() => {
              // Find the first article and open it
              fetch('/articles/index.json')
                .then(res => res.json())
                .then(data => {
                  if (data.articles && data.articles.length > 0) {
                    const firstArticle = data.articles[0];
                    const slug = firstArticle.filename.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
                    window.open(`/article/${slug}`, '_blank');
                  }
                })
                .catch(() => {
                  window.open('/article/bebek-uyku-duzeni-nasil-kurulur', '_blank');
                });
            }}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center space-x-2 transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Makale Detay</span>
          </button>
        </div>
      </div>

      {/* Ad Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reklam Önizleme</h3>
        <div className="space-y-6">
          {/* Desktop Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Desktop Görünümü</h4>
            <div className="space-y-4">
              {config.placements.desktop.showBannerAd && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Banner (728x90)</span>
                  <SmartAd
                    type="banner"
                    slotId={config.adSlots.desktopBanner}
                    className="border rounded"
                    showInAdmin={true}
                  />
                </div>
              )}

              {config.placements.desktop.showSidebar && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Sidebar (300x250)</span>
                  <SmartAd
                    type="sidebar"
                    slotId={config.adSlots.sidebar}
                    className="border rounded max-w-xs"
                    showInAdmin={true}
                  />
                </div>
              )}

              {config.placements.desktop.showAfterParagraph > 0 && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">İçerik Arası (728x90)</span>
                  <SmartAd
                    type="inline"
                    slotId={config.adSlots.articleMiddle}
                    className="border rounded"
                    showInAdmin={true}
                  />
                </div>
              )}

              {config.placements.desktop.showInFooter && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Footer (728x90)</span>
                  <SmartAd
                    type="footer"
                    slotId={config.adSlots.articleBottom}
                    className="border rounded"
                    showInAdmin={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Mobil Görünümü</h4>
            <div className="space-y-4">
              {config.placements.mobile.showInHeader && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Mobil Banner (320x50)</span>
                  <SmartAd
                    type="banner"
                    size="small"
                    slotId={config.adSlots.mobileInline}
                    className="border rounded max-w-sm"
                    showInAdmin={true}
                  />
                </div>
              )}

              {config.placements.mobile.showInlineAds && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Mobil İçerik (300x250)</span>
                  <SmartAd
                    type="inline"
                    slotId={config.adSlots.mobileInline}
                    className="border rounded max-w-xs"
                    showInAdmin={true}
                  />
                </div>
              )}

              {config.placements.mobile.showInFooter && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Mobil Footer (320x50)</span>
                  <SmartAd
                    type="footer"
                    size="small"
                    slotId={config.adSlots.articleBottom}
                    className="border rounded max-w-sm"
                    showInAdmin={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};