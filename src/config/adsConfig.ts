export interface AdsConfig {
  enabled: boolean;
  debugMode: boolean; // Show sample ads for testing
  googleAdsenseClientId?: string;
  adSlots: {
    articleTop: string;
    articleMiddle: string;
    articleBottom: string;
    sidebar: string;
    mobileInline: string;
    desktopBanner: string;
  };
  placements: {
    mobile: {
      showInHeader: boolean;
      showAfterParagraph: number; // Show ad after which paragraph
      showInFooter: boolean;
      maxAdsPerPage: number; // Maximum number of ads on mobile
      showInlineAds: boolean; // Show ads between content
    };
    desktop: {
      showSidebar: boolean;
      showAfterParagraph: number;
      showInFooter: boolean;
      maxAdsPerPage: number; // Maximum number of ads on desktop
      showBannerAd: boolean; // Show banner at top
      sidebarAdCount: number; // Number of ads in sidebar
    };
  };
  frequency: {
    articlesViewedBeforeAd: number; // Show ads after viewing X articles
    adDisplayInterval: number; // Minutes between showing ads to same user
  };
}

// Default configuration
const defaultAdsConfig: AdsConfig = {
  enabled: false, // Master toggle for all ads - starting disabled
  debugMode: false, // Show sample ads for testing - starting disabled
  googleAdsenseClientId: 'ca-pub-xxxxxxxxxxxxxxxxx', // Replace with your actual AdSense client ID
  adSlots: {
    articleTop: '1234567890',    // Replace with your actual ad slot IDs
    articleMiddle: '1234567891',
    articleBottom: '1234567892',
    sidebar: '1234567893',
    mobileInline: '1234567894',
    desktopBanner: '1234567895',
  },
  placements: {
    mobile: {
      showInHeader: false,
      showAfterParagraph: 2, // Show ad after 2nd paragraph
      showInFooter: true,
      maxAdsPerPage: 3, // Maximum 3 ads on mobile
      showInlineAds: true,
    },
    desktop: {
      showSidebar: true,
      showAfterParagraph: 3, // Show ad after 3rd paragraph
      showInFooter: true,
      maxAdsPerPage: 5, // Maximum 5 ads on desktop
      showBannerAd: false, // No banner at top by default
      sidebarAdCount: 2, // 2 ads in sidebar
    },
  },
  frequency: {
    articlesViewedBeforeAd: 2, // Show ads after viewing 2 articles
    adDisplayInterval: 10, // 10 minutes between showing ads
  },
};

// Load configuration from localStorage or use defaults
const loadAdsConfig = (): AdsConfig => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ads-config');
    if (stored) {
      try {
        const parsedConfig = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...defaultAdsConfig, ...parsedConfig };
      } catch (error) {
        console.warn('Failed to parse stored ads config, using defaults:', error);
      }
    }
  }
  return { ...defaultAdsConfig };
};

// Export the configuration
export const adsConfig: AdsConfig = loadAdsConfig();

// Helper functions
export const isAdsEnabled = (): boolean => adsConfig.enabled;

export const getAdPlacement = (device: 'mobile' | 'desktop') => {
  return adsConfig.placements[device];
};

export const getAdSlot = (position: keyof AdsConfig['adSlots']): string => {
  return adsConfig.adSlots[position];
};

// Save configuration to localStorage
export const saveAdsConfig = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ads-config', JSON.stringify(adsConfig));
    // Dispatch a custom event to notify components of config changes
    window.dispatchEvent(new CustomEvent('adsConfigChanged'));
  }
};