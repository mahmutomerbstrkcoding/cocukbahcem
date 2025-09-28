import React, { useState } from 'react';
import { adsConfig, AdsConfig } from '../../config/adsConfig';
import { Settings, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';

export const AdsConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<AdsConfig>(adsConfig);
  const [isModified, setIsModified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleAds = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    setIsModified(true);

    // Update the global config immediately for preview
    adsConfig.enabled = newConfig.enabled;
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
    device: 'mobile' | 'desktop',
    setting: string,
    value: boolean | number
  ) => {
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
  };

  const handleSave = () => {
    // Update the global config
    Object.assign(adsConfig, config);

    // In a real application, you would save this to a backend
    // For now, we'll just update the in-memory config
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
              Tüm reklamları {config.enabled ? 'göster' : 'gizle'}
            </p>
          </div>

          <button
            onClick={handleToggleAds}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              config.enabled
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.enabled ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Aktif</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Pasif</span>
              </>
            )}
          </button>
        </div>
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
          </div>
        </div>
      </div>

      {/* Mobile Placement Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Mobil Reklam Yerleşimi
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaçıncı paragraftan sonra reklam göster
            </label>
            <input
              type="number"
              min="1"
              value={config.placements.mobile.showAfterParagraph}
              onChange={(e) => handlePlacementChange('mobile', 'showAfterParagraph', parseInt(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Desktop Placement Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Masaüstü Reklam Yerleşimi
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaçıncı paragraftan sonra reklam göster
            </label>
            <input
              type="number"
              min="1"
              value={config.placements.desktop.showAfterParagraph}
              onChange={(e) => handlePlacementChange('desktop', 'showAfterParagraph', parseInt(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reklam Önizlemesi
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Reklamlar şu anda: <strong>{config.enabled ? 'Aktif' : 'Pasif'}</strong></p>
          <p>• Mobil: {config.placements.mobile.showAfterParagraph}. paragraf sonrası + {config.placements.mobile.showInFooter ? 'Alt kısım' : 'Alt kısım yok'}</p>
          <p>• Masaüstü: {config.placements.desktop.showAfterParagraph}. paragraf sonrası + {config.placements.desktop.showSidebar ? 'Sidebar' : 'Sidebar yok'} + {config.placements.desktop.showInFooter ? 'Alt kısım' : 'Alt kısım yok'}</p>
        </div>
      </div>
    </div>
  );
};