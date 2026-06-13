import { Reaction, ReactionSchema, ALLOWED_EMOJI_VALUES } from './reaction.schema';

describe('Reaction schema', () => {
  it('should define commentId, userId, and emoji paths', () => {
    const paths = ReactionSchema.paths;
    expect(paths['commentId']).toBeDefined();
    expect(paths['userId']).toBeDefined();
    expect(paths['emoji']).toBeDefined();
  });

  it('should require commentId', () => {
    const path = ReactionSchema.path('commentId') as any;
    expect(path.isRequired).toBe(true);
  });

  it('should require userId', () => {
    const path = ReactionSchema.path('userId') as any;
    expect(path.isRequired).toBe(true);
  });

  it('should require emoji', () => {
    const path = ReactionSchema.path('emoji') as any;
    expect(path.isRequired).toBe(true);
  });

  it('should export ALLOWED_EMOJI_VALUES with 6 entries', () => {
    expect(ALLOWED_EMOJI_VALUES).toHaveLength(6);
    expect(ALLOWED_EMOJI_VALUES).toContain('👍');
    expect(ALLOWED_EMOJI_VALUES).toContain('❤️');
    expect(ALLOWED_EMOJI_VALUES).toContain('😂');
    expect(ALLOWED_EMOJI_VALUES).toContain('😮');
    expect(ALLOWED_EMOJI_VALUES).toContain('😢');
    expect(ALLOWED_EMOJI_VALUES).toContain('😡');
  });

  it('should assign commentId, userId, emoji on class instance', () => {
    const instance = new Reaction();
    instance.commentId = 'c-1';
    instance.userId = 'u-1';
    instance.emoji = '👍';

    expect(instance.commentId).toBe('c-1');
    expect(instance.userId).toBe('u-1');
    expect(instance.emoji).toBe('👍');
  });
});
