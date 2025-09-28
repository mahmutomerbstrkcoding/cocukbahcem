import React, { useEffect } from 'react';
import { isAdsEnabled, adsConfig } from '../config/adsConfig';

export interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  className = '',
  style = {},
  responsive = true,
}) => {
  useEffect(() => {
    if (!isAdsEnabled()) {
      return;
    }

    try {
      // Initialize AdSense if not already done
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Don't render if ads are disabled
  if (!isAdsEnabled()) {
    return null;
  }

  const defaultStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    margin: '20px 0',
    ...style,
  };

  return (
    <div className={`ad-banner ${className}`} style={defaultStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsConfig.googleAdsenseClientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

// Specific ad components for different placements
export const MobileAdBanner: React.FC<{ adSlot: string }> = ({ adSlot }) => (
  <AdBanner
    adSlot={adSlot}
    adFormat="auto"
    className="block md:hidden mobile-ad"
    style={{ margin: '15px 0' }}
  />
);

export const DesktopAdBanner: React.FC<{ adSlot: string }> = ({ adSlot }) => (
  <AdBanner
    adSlot={adSlot}
    adFormat="rectangle"
    className="hidden md:block desktop-ad"
    style={{ margin: '20px auto', maxWidth: '336px' }}
  />
);

export const SidebarAdBanner: React.FC<{ adSlot: string }> = ({ adSlot }) => (
  <AdBanner
    adSlot={adSlot}
    adFormat="vertical"
    className="sidebar-ad"
    style={{
      margin: '20px 0',
      maxWidth: '300px',
      position: 'sticky',
      top: '20px'
    }}
  />
);

export const ResponsiveAdBanner: React.FC<{ adSlot: string }> = ({ adSlot }) => (
  <div className="responsive-ad-container">
    <MobileAdBanner adSlot={adSlot} />
    <DesktopAdBanner adSlot={adSlot} />
  </div>
);