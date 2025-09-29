import { AdsManager } from './adsManager';
import { adsConfig } from '../config/adsConfig';

interface AdInjectionOptions {
  content: string;
  deviceType: 'mobile' | 'desktop';
}

const adsManager = AdsManager.getInstance();

export const getAdInsertionPoints = ({ content, deviceType }: AdInjectionOptions): number[] => {
  if (!adsManager.shouldShowAds()) {
    return [];
  }

  const config = adsConfig.placements[deviceType];
  const afterParagraph = config.showAfterParagraph;

  // Split content by paragraphs to find insertion points
  const paragraphs = content.split('\n\n');
  const insertionPoints: number[] = [];

  if (afterParagraph > 0 && afterParagraph <= paragraphs.length) {
    // Calculate approximate character position after the specified paragraph
    let charPosition = 0;
    for (let i = 0; i < afterParagraph && i < paragraphs.length; i++) {
      charPosition += paragraphs[i].length + 2; // +2 for \n\n
    }
    insertionPoints.push(charPosition);
  }

  return insertionPoints;
};

export const shouldShowAd = (
  position: 'header' | 'footer' | 'sidebar' | 'banner' | 'inline',
  deviceType: 'mobile' | 'desktop'
): boolean => {
  return adsManager.shouldShowAdPlacement(
    position as 'sidebar' | 'footer' | 'inline' | 'banner',
    deviceType
  );
};

// Record article view for ads frequency management
export const recordArticleView = (): void => {
  adsManager.recordArticleView();
};

// Record ad display for frequency management
export const recordAdDisplay = (): void => {
  adsManager.recordAdDisplay();
};

// Get ad slot ID for a specific placement
export const getAdSlot = (placement: 'articleTop' | 'articleMiddle' | 'articleBottom' | 'sidebar' | 'mobileInline' | 'desktopBanner'): string => {
  return adsManager.getAdSlot(placement);
};

// Check if ads are enabled globally
export const isAdsEnabled = (): boolean => {
  return adsConfig.enabled;
};