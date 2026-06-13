import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReactionsService } from './reactions.service';
import { Reaction } from '../schemas/reaction.schema';

describe('ReactionsService', () => {
  let service: ReactionsService;

  const mockExec = jest.fn();
  const mockSave = jest.fn();
  const mockDeleteOne = jest.fn();
  const mockDeleteMany = jest.fn();

  const MockReactionModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockReactionModel.findOne = jest.fn();
  MockReactionModel.find = jest.fn();
  MockReactionModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  MockReactionModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 2 });

  beforeEach(async () => {
    jest.clearAllMocks();

    MockReactionModel.findOne = jest.fn();
    MockReactionModel.find = jest.fn();
    MockReactionModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    MockReactionModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 2 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionsService,
        {
          provide: getModelToken(Reaction.name),
          useValue: MockReactionModel,
        },
      ],
    }).compile();

    service = module.get<ReactionsService>(ReactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── addReaction ────────────────────────────────────────────────────────────

  describe('addReaction', () => {
    it('should create and save a new reaction when none exists', async () => {
      const dto = { commentId: 'c1', userId: 'u1', emoji: '👍' };
      const savedReaction = { ...dto, _id: 'r1' };

      MockReactionModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockSave.mockResolvedValue(savedReaction);

      const result = await service.addReaction(dto);

      expect(result).toEqual(savedReaction);
      expect(MockReactionModel.findOne).toHaveBeenCalledWith({
        commentId: 'c1',
        userId: 'u1',
        emoji: '👍',
      });
      expect(MockReactionModel).toHaveBeenCalledWith(dto);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should return existing reaction without creating a duplicate', async () => {
      const dto = { commentId: 'c1', userId: 'u1', emoji: '👍' };
      const existingReaction = { ...dto, _id: 'r-existing' };

      MockReactionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingReaction),
      });

      const result = await service.addReaction(dto);

      expect(result).toEqual(existingReaction);
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should allow same user to react with different emoji', async () => {
      const dto = { commentId: 'c1', userId: 'u1', emoji: '❤️' };
      const savedReaction = { ...dto, _id: 'r2' };

      MockReactionModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockSave.mockResolvedValue(savedReaction);

      const result = await service.addReaction(dto);

      expect(result).toEqual(savedReaction);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  // ─── removeReaction ─────────────────────────────────────────────────────────

  describe('removeReaction', () => {
    it('should call deleteOne with correct filter', async () => {
      await service.removeReaction('c1', 'u1', '👍');

      expect(MockReactionModel.deleteOne).toHaveBeenCalledWith({
        commentId: 'c1',
        userId: 'u1',
        emoji: '👍',
      });
    });

    it('should resolve without error when reaction does not exist', async () => {
      MockReactionModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.removeReaction('c1', 'u1', '👍')).resolves.toBeUndefined();
    });
  });

  // ─── getReactionsByComment ──────────────────────────────────────────────────

  describe('getReactionsByComment', () => {
    it('should return reactions grouped by emoji with count and users', async () => {
      const rawReactions = [
        { emoji: '👍', userId: 'u1' },
        { emoji: '👍', userId: 'u2' },
        { emoji: '❤️', userId: 'u3' },
      ];

      MockReactionModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(rawReactions),
        }),
      });

      const result = await service.getReactionsByComment('c1');

      expect(result).toHaveLength(2);

      const thumbsUp = result.find((r: any) => r.emoji === '👍');
      expect(thumbsUp).toBeDefined();
      expect(thumbsUp.count).toBe(2);
      expect(thumbsUp.users).toContain('u1');
      expect(thumbsUp.users).toContain('u2');

      const heart = result.find((r: any) => r.emoji === '❤️');
      expect(heart).toBeDefined();
      expect(heart.count).toBe(1);
      expect(heart.users).toContain('u3');
    });

    it('should return empty array when comment has no reactions', async () => {
      MockReactionModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getReactionsByComment('c-empty');

      expect(result).toEqual([]);
    });

    it('should deduplicate users per emoji group', async () => {
      // Same userId shouldn't appear twice in the users list (unique by userId)
      const rawReactions = [
        { emoji: '👍', userId: 'u1' },
        { emoji: '👍', userId: 'u1' }, // duplicate userId in raw data
      ];

      MockReactionModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(rawReactions),
        }),
      });

      const result = await service.getReactionsByComment('c1');
      const thumbsUp = result.find((r: any) => r.emoji === '👍');

      // Set-based dedup: users list should have unique entries
      const uniqueUsers = [...new Set(thumbsUp.users)];
      expect(thumbsUp.users).toEqual(uniqueUsers);
    });
  });

  // ─── getUserReaction ────────────────────────────────────────────────────────

  describe('getUserReaction', () => {
    it('should return emoji string when user has reacted', async () => {
      MockReactionModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ emoji: '👍' }),
        }),
      });

      const result = await service.getUserReaction('c1', 'u1');

      expect(result).toBe('👍');
    });

    it('should return null when user has not reacted', async () => {
      MockReactionModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.getUserReaction('c1', 'u-stranger');

      expect(result).toBeNull();
    });
  });

  // ─── removeAllUserReactions ─────────────────────────────────────────────────

  describe('removeAllUserReactions', () => {
    it('should call deleteMany with commentId and userId filter', async () => {
      await service.removeAllUserReactions('c1', 'u1');

      expect(MockReactionModel.deleteMany).toHaveBeenCalledWith({
        commentId: 'c1',
        userId: 'u1',
      });
    });
  });
});
