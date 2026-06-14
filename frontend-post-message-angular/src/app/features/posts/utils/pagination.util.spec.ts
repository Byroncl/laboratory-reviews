// utils/pagination.util.spec.ts
import {
  calculateTotalPages,
  calculateCurrentPage,
  canGoToNextPage,
  canGoToPreviousPage,
  getNextPageSkip,
  getPreviousPageSkip,
  resetPagination,
  isValidPaginationParams,
} from './pagination.util';
import { IPagination } from '../interfaces';

describe('pagination.util', () => {

  // ─── calculateTotalPages ────────────────────────────────────────────────────

  describe('calculateTotalPages', () => {
    it('should return 3 for total=25, limit=10', () => {
      expect(calculateTotalPages(25, 10)).toBe(3);
    });

    it('should return 1 for total=10, limit=10', () => {
      expect(calculateTotalPages(10, 10)).toBe(1);
    });

    it('should return 0 for total=0, limit=10', () => {
      expect(calculateTotalPages(0, 10)).toBe(0);
    });

    it('should return 2 for total=11, limit=10', () => {
      expect(calculateTotalPages(11, 10)).toBe(2);
    });
  });

  // ─── calculateCurrentPage ───────────────────────────────────────────────────

  describe('calculateCurrentPage', () => {
    it('should return 1 when skip=0', () => {
      expect(calculateCurrentPage(0, 10)).toBe(1);
    });

    it('should return 2 when skip=10', () => {
      expect(calculateCurrentPage(10, 10)).toBe(2);
    });

    it('should return 3 when skip=20', () => {
      expect(calculateCurrentPage(20, 10)).toBe(3);
    });
  });

  // ─── canGoToNextPage ────────────────────────────────────────────────────────

  describe('canGoToNextPage', () => {
    it('should return true when not on last page', () => {
      const pagination: IPagination = { skip: 0, limit: 10, total: 25 };
      expect(canGoToNextPage(pagination)).toBeTrue();
    });

    it('should return false when on last page', () => {
      const pagination: IPagination = { skip: 20, limit: 10, total: 25 };
      expect(canGoToNextPage(pagination)).toBeFalse();
    });

    it('should return false when total is 0', () => {
      const pagination: IPagination = { skip: 0, limit: 10, total: 0 };
      expect(canGoToNextPage(pagination)).toBeFalse();
    });
  });

  // ─── canGoToPreviousPage ────────────────────────────────────────────────────

  describe('canGoToPreviousPage', () => {
    it('should return true when skip > 0', () => {
      const pagination: IPagination = { skip: 10, limit: 10, total: 30 };
      expect(canGoToPreviousPage(pagination)).toBeTrue();
    });

    it('should return false when skip = 0', () => {
      const pagination: IPagination = { skip: 0, limit: 10, total: 30 };
      expect(canGoToPreviousPage(pagination)).toBeFalse();
    });
  });

  // ─── getNextPageSkip ────────────────────────────────────────────────────────

  describe('getNextPageSkip', () => {
    it('should advance skip by limit when next page is available', () => {
      const pagination: IPagination = { skip: 0, limit: 10, total: 30 };
      expect(getNextPageSkip(pagination)).toBe(10);
    });

    it('should return same skip when on last page', () => {
      const pagination: IPagination = { skip: 20, limit: 10, total: 25 };
      expect(getNextPageSkip(pagination)).toBe(20);
    });
  });

  // ─── getPreviousPageSkip ────────────────────────────────────────────────────

  describe('getPreviousPageSkip', () => {
    it('should decrement skip by limit', () => {
      const pagination: IPagination = { skip: 20, limit: 10, total: 30 };
      expect(getPreviousPageSkip(pagination)).toBe(10);
    });

    it('should return 0 when on first page', () => {
      const pagination: IPagination = { skip: 0, limit: 10, total: 30 };
      expect(getPreviousPageSkip(pagination)).toBe(0);
    });

    it('should not go below 0 (max(0, skip - limit) guard)', () => {
      const pagination: IPagination = { skip: 5, limit: 10, total: 30 };
      expect(getPreviousPageSkip(pagination)).toBe(0);
    });
  });

  // ─── resetPagination ────────────────────────────────────────────────────────

  describe('resetPagination', () => {
    it('should return { skip: 0, limit, total: 0 }', () => {
      expect(resetPagination(10)).toEqual({ skip: 0, limit: 10, total: 0 });
    });

    it('should use the provided limit', () => {
      expect(resetPagination(25)).toEqual({ skip: 0, limit: 25, total: 0 });
    });
  });

  // ─── isValidPaginationParams ────────────────────────────────────────────────

  describe('isValidPaginationParams', () => {
    it('should return true for valid params', () => {
      expect(isValidPaginationParams(0, 10, 100)).toBeTrue();
    });

    it('should return false when skip < 0', () => {
      expect(isValidPaginationParams(-1, 10, 100)).toBeFalse();
    });

    it('should return false when limit = 0', () => {
      expect(isValidPaginationParams(0, 0, 100)).toBeFalse();
    });

    it('should return false when limit > maxLimit', () => {
      expect(isValidPaginationParams(0, 200, 100)).toBeFalse();
    });

    it('should return true when limit equals maxLimit', () => {
      expect(isValidPaginationParams(0, 100, 100)).toBeTrue();
    });
  });
});
