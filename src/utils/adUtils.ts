import { isAdsEnabled } from '../config/adsConfig';

interface AdInjectionOptions {
  content: string;
  afterParagraph: number;
}

export const getAdInsertionPoints = ({ content, afterParagraph }: AdInjectionOptions): number[] => {
  if (!isAdsEnabled()) {
    return [];
  }

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

export const shouldShowAd = (position: 'header' | 'footer' | 'sidebar', deviceType: 'mobile' | 'desktop'): boolean => {
  if (!isAdsEnabled()) return false;

  const placement = deviceType === 'mobile'
    ? { showInHeader: false, showInFooter: true, showSidebar: false }
    : { showInHeader: false, showInFooter: true, showSidebar: true };

  switch (position) {
    case 'header':
      return deviceType === 'mobile' ? placement.showInHeader : false;
    case 'footer':
      return placement.showInFooter;
    case 'sidebar':
      return deviceType === 'desktop' && placement.showSidebar;
    default:
      return false;
  }
};