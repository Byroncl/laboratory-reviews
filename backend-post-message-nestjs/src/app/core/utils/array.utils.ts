export class ArrayUtils {
  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  static flatten<T>(arr: T[][]): T[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
  }

  static paginate<T>(
    arr: T[],
    page: number,
    limit: number,
  ): { data: T[]; total: number; pages: number } {
    const total = arr.length;
    const pages = Math.ceil(total / limit);
    const data = arr.slice((page - 1) * limit, page * limit);
    return { data, total, pages };
  }

  static chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  static isEmpty<T>(arr: T[]): boolean {
    return !arr || arr.length === 0;
  }
}
