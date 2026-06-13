export class DateUtils {
  static formatISO(date: Date): string {
    return date.toISOString();
  }

  static formatLocale(date: Date, locale: string = 'en-US'): string {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  static isExpired(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  static addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }

  static addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
