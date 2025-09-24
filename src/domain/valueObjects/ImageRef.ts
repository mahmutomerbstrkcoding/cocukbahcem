export class ImageRef {
  constructor(
    public readonly url: string,
    public readonly alt: string,
    public readonly width?: number,
    public readonly height?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.url || this.url.trim().length === 0) {
      throw new Error('Image URL cannot be empty');
    }

    if (!this.alt || this.alt.trim().length === 0) {
      throw new Error('Image alt text cannot be empty');
    }

    // Basic URL validation
    try {
      new URL(this.url.startsWith('/') ? `https://example.com${this.url}` : this.url);
    } catch {
      throw new Error('Invalid image URL format');
    }

    if (this.width !== undefined && this.width <= 0) {
      throw new Error('Image width must be positive');
    }

    if (this.height !== undefined && this.height <= 0) {
      throw new Error('Image height must be positive');
    }
  }

  equals(other: ImageRef): boolean {
    return this.url === other.url;
  }

  toString(): string {
    return this.url;
  }

  isExternal(): boolean {
    return this.url.startsWith('http://') || this.url.startsWith('https://');
  }

  isLocal(): boolean {
    return this.url.startsWith('/');
  }
}