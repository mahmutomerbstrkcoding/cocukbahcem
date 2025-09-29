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
  FAMILY: new Category('aile-hayati', 'Aile Hayatı', 'Aile hayatı ve ebeveynlik deneyimleri'),
  BABIES: new Category('bebekler', 'Bebekler', 'Bebek bakımı ve gelişimi'),
  PREGNANCY: new Category('hamilelik', 'Hamilelik', 'Hamilelik dönemi ile ilgili içerikler'),
  PRESCHOOL: new Category('okul-oncesi', 'Okul Öncesi', 'Okul öncesi dönem ve eğitim'),
  TIPS: new Category('ipuclari', 'İpuçları', 'Pratik ipuçları ve öneriler'),
} as const;