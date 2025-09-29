import { adsConfig, AdsConfig } from '../config/adsConfig';

interface AdDisplayState {
  articlesViewed: number;
  lastAdDisplayTime: number;
  sessionStartTime: number;
}

class AdsManager {
  private static instance: AdsManager;
  private displayState: AdDisplayState;

  private constructor() {
    // Initialize display state from localStorage or create new
    const stored = localStorage.getItem('ads-display-state');
    if (stored) {
      this.displayState = JSON.parse(stored);
    } else {
      this.displayState = {
        articlesViewed: 0,
        lastAdDisplayTime: 0,
        sessionStartTime: Date.now(),
      };
    }
  }

  static getInstance(): AdsManager {
    if (!AdsManager.instance) {
      AdsManager.instance = new AdsManager();
    }
    return AdsManager.instance;
  }

  // Check if ads should be displayed based on frequency settings
  shouldShowAds(): boolean {
    if (!adsConfig.enabled) {
      return false;
    }

    const now = Date.now();
    const { articlesViewedBeforeAd, adDisplayInterval } = adsConfig.frequency;

    // Check if user has viewed enough articles
    if (this.displayState.articlesViewed < articlesViewedBeforeAd) {
      return false;
    }

    // Check if enough time has passed since last ad
    const timeSinceLastAd = now - this.displayState.lastAdDisplayTime;
    const intervalInMs = adDisplayInterval * 60 * 1000; // Convert minutes to milliseconds

    if (timeSinceLastAd < intervalInMs) {
      return false;
    }

    return true;
  }

  // Record that user viewed an article
  recordArticleView(): void {
    this.displayState.articlesViewed++;
    this.saveState();
  }

  // Record that an ad was displayed
  recordAdDisplay(): void {
    this.displayState.lastAdDisplayTime = Date.now();
    this.saveState();
  }

  // Get current ads configuration
  getConfig(): AdsConfig {
    return adsConfig;
  }

  // Update configuration (for admin panel)
  updateConfig(newConfig: Partial<AdsConfig>): void {
    Object.assign(adsConfig, newConfig);
  }

  // Check if specific ad placement should be shown
  shouldShowAdPlacement(
    placement: 'sidebar' | 'footer' | 'inline' | 'banner',
    deviceType: 'mobile' | 'desktop'
  ): boolean {
    if (!this.shouldShowAds()) {
      return false;
    }

    if (deviceType === 'mobile') {
      const config = adsConfig.placements.mobile;
      switch (placement) {
        case 'footer':
          return config.showInFooter;
        case 'inline':
          return config.showInlineAds;
        default:
          return false;
      }
    } else {
      const config = adsConfig.placements.desktop;
      switch (placement) {
        case 'sidebar':
          return config.showSidebar;
        case 'footer':
          return config.showInFooter;
        case 'banner':
          return config.showBannerAd;
        case 'inline':
          return true; // Desktop can show inline ads
        default:
          return false;
      }
    }
  }

  // Get ad slot ID for specific placement
  getAdSlot(placement: keyof AdsConfig['adSlots']): string {
    return adsConfig.adSlots[placement];
  }

  // Reset ads state (for testing)
  resetState(): void {
    this.displayState = {
      articlesViewed: 0,
      lastAdDisplayTime: 0,
      sessionStartTime: Date.now(),
    };
    this.saveState();
  }

  // Get display statistics (for admin panel)
  getDisplayStats(): AdDisplayState {
    return { ...this.displayState };
  }

  private saveState(): void {
    localStorage.setItem('ads-display-state', JSON.stringify(this.displayState));
  }
}

export default AdsManager;
export { AdsManager };