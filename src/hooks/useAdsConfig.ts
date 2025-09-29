import { useState, useEffect } from 'react';
import { adsConfig, AdsConfig } from '../config/adsConfig';

// Custom hook to reactively track ads configuration changes
export const useAdsConfig = (): AdsConfig => {
  const [config, setConfig] = useState<AdsConfig>(() => ({ ...adsConfig }));

  useEffect(() => {
    // Create a function to update the local state when config changes
    const updateConfig = () => {
      setConfig({ ...adsConfig });
    };

    // Check for config changes periodically (fallback)
    const interval = setInterval(updateConfig, 1000);

    // Custom event listener for immediate updates
    const handleConfigChange = () => {
      updateConfig();
    };

    // Listen for custom config change events
    window.addEventListener('adsConfigChanged', handleConfigChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('adsConfigChanged', handleConfigChange);
    };
  }, []);

  return config;
};