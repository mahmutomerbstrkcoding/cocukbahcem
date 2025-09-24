export class Category {
  constructor(
    public readonly value: string,
    public readonly displayName: string,
    public readonly description?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('Category value cannot be empty');
    }

    if (!this.displayName || this.displayName.trim().length === 0) {
      throw new Error('Category display name cannot be empty');
    }

    // Slug format validation
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(this.value)) {
      throw new Error('Category value must be a valid slug (lowercase, hyphenated)');
    }
  }

  equals(other: Category): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Predefined categories
export const CATEGORIES = {
  PREGNANCY: new Category('pregnancy', 'Hamilelik', 'Hamilelik dönemi ile ilgili içerikler'),
  BABIES: new Category('babies', 'Bebekler', 'Bebek bakımı ve gelişimi'),
  FAMILY: new Category('family', 'Aile', 'Aile hayatı ve ebeveynlik'),
  TIPS: new Category('tips', 'İpuçları', 'Pratik ipuçları ve öneriler'),
  HEALTH: new Category('health', 'Sağlık', 'Anne ve bebek sağlığı'),
} as const;