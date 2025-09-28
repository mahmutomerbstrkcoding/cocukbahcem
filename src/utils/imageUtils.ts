/**
 * Utility functions for handling image URLs
 */

/**
 * Determines if an image URL is external (starts with http/https) or local
 * @param imageUrl - The image URL to check
 * @returns true if external, false if local
 */
export const isExternalUrl = (imageUrl: string): boolean => {
  return imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
};

/**
 * Resolves an image URL to the correct path
 * External URLs are returned as-is
 * Local URLs are prefixed with the public path if needed
 * @param imageUrl - The image URL to resolve
 * @returns The resolved image URL
 */
export const resolveImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';

  // If it's an external URL, return as-is
  if (isExternalUrl(imageUrl)) {
    return imageUrl;
  }

  // If it's already an absolute path starting with /, return as-is
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Otherwise, assume it's relative to the assets directory
  return `/assets/images/${imageUrl}`;
};

/**
 * Gets a placeholder image URL based on category
 * @param category - The article category
 * @returns A placeholder image URL
 */
export const getCategoryPlaceholder = (category: string): string => {
  const placeholders: Record<string, string> = {
    pregnancy: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop&auto=format',
    babies: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&auto=format',
    family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop&auto=format',
    tips: 'https://images.unsplash.com/photo-1516627145497-ae4c4b43e3b5?w=400&h=300&fit=crop&auto=format',
  };

  return placeholders[category] || 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&auto=format';
};

/**
 * Validates if an image URL is accessible
 * @param imageUrl - The image URL to validate
 * @returns Promise that resolves to true if accessible, false otherwise
 */
export const validateImageUrl = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = resolveImageUrl(imageUrl);
  });
};