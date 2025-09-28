export interface AdsConfig {
  enabled: boolean;
  googleAdsenseClientId?: string;
  adSlots: {
    articleTop: string;
    articleMiddle: string;
    articleBottom: string;
    sidebar: string;
  };
  placements: {
    mobile: {
      showInHeader: boolean;
      showAfterParagraph: number; // Show ad after which paragraph
      showInFooter: boolean;
    };
    desktop: {
      showSidebar: boolean;
      showAfterParagraph: number;
      showInFooter: boolean;
    };
  };
}

export const adsConfig: AdsConfig = {
  enabled: true, // Master toggle for all ads
  googleAdsenseClientId: 'ca-pub-xxxxxxxxxxxxxxxxx', // Replace with your actual AdSense client ID
  adSlots: {
    articleTop: '1234567890',    // Replace with your actual ad slot IDs
    articleMiddle: '1234567891',
    articleBottom: '1234567892',
    sidebar: '1234567893',
  },
  placements: {
    mobile: {
      showInHeader: false,
      showAfterParagraph: 2, // Show ad after 2nd paragraph
      showInFooter: true,
    },
    desktop: {
      showSidebar: true,
      showAfterParagraph: 3, // Show ad after 3rd paragraph
      showInFooter: true,
    },
  },
};

// Helper functions
export const isAdsEnabled = (): boolean => adsConfig.enabled;

export const getAdPlacement = (device: 'mobile' | 'desktop') => {
  return adsConfig.placements[device];
};

export const getAdSlot = (position: keyof AdsConfig['adSlots']): string => {
  return adsConfig.adSlots[position];
};