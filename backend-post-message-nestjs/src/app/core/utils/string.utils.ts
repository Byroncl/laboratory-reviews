export class StringUtils {
  static generateRandomId(length: number = 16): string {
    return Math.random()
      .toString(36)
      .slice(2, 2 + length);
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  static trim(text: string): string {
    return text?.trim() || '';
  }

  static isEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static isEmpty(text: string | null | undefined): boolean {
    return !text || text.trim().length === 0;
  }
}
