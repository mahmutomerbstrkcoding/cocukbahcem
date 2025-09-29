// Category mapping between old file system names and new display names
export const CATEGORY_MAPPING = {
  // Old system -> New system
  'pregnancy': 'hamilelik',
  'babies': 'bebekler',
  'family': 'aile-hayati',
  'tips': 'ipuclari',
  'preschool': 'okul-oncesi',

  // New system -> Old system (for file lookups)
  'hamilelik': 'pregnancy',
  'bebekler': 'babies',
  'aile-hayati': 'family',
  'ipuclari': 'tips',
  'okul-oncesi': 'preschool', // Create proper mapping for preschool
} as const;

export const CATEGORY_DISPLAY_NAMES = {
  'aile-hayati': 'Aile Hayatı',
  'bebekler': 'Bebekler',
  'hamilelik': 'Hamilelik',
  'okul-oncesi': 'Okul Öncesi',
  'ipuclari': 'İpuçları',
} as const;

export const CATEGORY_ICONS = {
  'aile-hayati': '👨‍👩‍👧‍👦',
  'bebekler': '👶',
  'hamilelik': '🤱',
  'okul-oncesi': '🎒',
  'ipuclari': '💡',
} as const;

// Convert old category name to new category name
export const mapOldCategoryToNew = (oldCategory: string): string => {
  return CATEGORY_MAPPING[oldCategory as keyof typeof CATEGORY_MAPPING] || oldCategory;
};

// Convert new category name to old category name (for file system lookups)
export const mapNewCategoryToOld = (newCategory: string): string => {
  return CATEGORY_MAPPING[newCategory as keyof typeof CATEGORY_MAPPING] || newCategory;
};

// Get display name for category
export const getCategoryDisplayName = (category: string): string => {
  return CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || category;
};

// Get icon for category
export const getCategoryIcon = (category: string): string => {
  return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📚';
};