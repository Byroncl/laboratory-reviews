import { PaginationService } from './pagination.service';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(() => {
    service = new PaginationService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('paginate', () => {
    it('should return paginated data with correct metadata', async () => {
      const mockItems = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const mockModel = {
        find: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockItems),
        countDocuments: jest.fn().mockReturnThis(),
      } as any;
      // countDocuments needs its own exec chain
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await service.paginate(mockModel, 1, 3, {});

      expect(result.data).toEqual(mockItems);
      expect(result.total).toBe(10);
      expect(result.pages).toBe(4); // ceil(10/3) = 4
    });

    it('should skip the correct number of records for page 2', async () => {
      const mockItems = [{ id: '4' }];
      const findChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockItems),
      };
      const mockModel = {
        find: jest.fn().mockReturnValue(findChain),
        countDocuments: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(4),
        }),
      } as any;

      await service.paginate(mockModel, 2, 3, {});

      expect(findChain.skip).toHaveBeenCalledWith(3); // (2-1)*3 = 3
    });

    it('should use default page=1 limit=10 when not provided', async () => {
      const findChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      const mockModel = {
        find: jest.fn().mockReturnValue(findChain),
        countDocuments: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        }),
      } as any;

      await service.paginate(mockModel);

      expect(findChain.skip).toHaveBeenCalledWith(0); // (1-1)*10 = 0
      expect(findChain.limit).toHaveBeenCalledWith(10);
    });
  });
});
