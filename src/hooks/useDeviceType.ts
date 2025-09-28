import { useState, useEffect } from 'react';
import { getAdPlacement } from '../config/adsConfig';

export const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isDesktop: !isMobile };
};

export const useAdPlacements = () => {
  const { isMobile } = useDeviceType();
  const deviceType: 'mobile' | 'desktop' = isMobile ? 'mobile' : 'desktop';
  const placement = getAdPlacement(deviceType);

  return {
    ...placement,
    deviceType,
  };
};