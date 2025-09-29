import React from 'react';
import { adsConfig } from '../config/adsConfig';
import { AdsManager } from '../utils/adsManager';
import { AdPlaceholder } from './AdPlaceholder';

interface SmartAdProps {
  type: 'banner' | 'sidebar' | 'inline' | 'footer';
  size?: 'small' | 'medium' | 'large';
  slotId?: string;
  className?: string;
  showInAdmin?: boolean;
  onConfigClick?: () => void;
}

const adsManager = AdsManager.getInstance();

export const SmartAd: React.FC<SmartAdProps> = ({
  type,
  size = 'medium',
  slotId,
  className = '',
  showInAdmin = false,
  onConfigClick
}) => {
  // Check if ads are enabled
  const adsEnabled = adsConfig.enabled;

  // Check if Google AdSense is properly configured
  const hasValidConfig = adsConfig.googleAdsenseClientId &&
                        adsConfig.googleAdsenseClientId !== 'ca-pub-xxxxxxxxxxxxxxxxx' &&
                        slotId &&
                        slotId !== '1234567890' &&
                        !slotId.includes('123456789');

  // Check if ads should be shown based on frequency and user behavior
  const shouldShowAds = adsManager.shouldShowAds();

  // If ads are disabled, show nothing
  if (!adsEnabled) {
    return null;
  }

  // If ads are enabled but not properly configured, show placeholder
  if (!hasValidConfig || !shouldShowAds) {
    return (
      <AdPlaceholder
        type={type}
        size={size}
        showConfig={showInAdmin}
        onConfigClick={onConfigClick}
        className={className}
      />
    );
  }

  // If everything is configured properly, show real Google AdSense ad
  return (
    <div className={`ad-container ${className}`}>
      <RealGoogleAd
        clientId={adsConfig.googleAdsenseClientId!}
        slotId={slotId}
        type={type}
        size={size}
      />
    </div>
  );
};

interface RealGoogleAdProps {
  clientId: string;
  slotId: string;
  type: 'banner' | 'sidebar' | 'inline' | 'footer';
  size: 'small' | 'medium' | 'large';
}

const RealGoogleAd: React.FC<RealGoogleAdProps> = ({ clientId, slotId, type, size }) => {
  const getAdSize = () => {
    const sizeMap = {
      banner: {
        small: { width: 320, height: 50 },
        medium: { width: 728, height: 90 },
        large: { width: 970, height: 90 }
      },
      sidebar: {
        small: { width: 200, height: 200 },
        medium: { width: 300, height: 250 },
        large: { width: 336, height: 280 }
      },
      inline: {
        small: { width: 300, height: 250 },
        medium: { width: 728, height: 90 },
        large: { width: 970, height: 250 }
      },
      footer: {
        small: { width: 320, height: 50 },
        medium: { width: 728, height: 90 },
        large: { width: 970, height: 90 }
      }
    };

    return sizeMap[type][size];
  };

  const adSize = getAdSize();

  React.useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Push ad after component mounts
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [clientId]);

  return (
    <div className="text-center">
      <ins
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: `${adSize.width}px`,
          height: `${adSize.height}px`
        }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// Type declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default SmartAd;