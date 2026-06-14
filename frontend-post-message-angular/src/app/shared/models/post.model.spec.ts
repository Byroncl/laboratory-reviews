import { mapToPostViewModel } from './post.model';

describe('mapToPostViewModel', () => {
  it('prefers body over content for preview', () => {
    const raw = { id: '1', _id: '1', title: 'T', body: 'Hello body', content: 'Also content', author: 'alice', createdAt: '2024-01-01' };
    const vm = mapToPostViewModel(raw);
    expect(vm.preview).toBe('Hello body');
  });

  it('falls back to content when body is absent', () => {
    const raw = { id: '1', _id: '1', title: 'T', content: 'Fallback text', author: 'alice', createdAt: '2024-01-01' };
    const vm = mapToPostViewModel(raw);
    expect(vm.preview).toBe('Fallback text');
  });

  it('truncates preview to 200 characters', () => {
    const longText = 'a'.repeat(300);
    const raw = { id: '1', _id: '1', title: 'T', body: longText, author: 'alice', createdAt: '2024-01-01' };
    const vm = mapToPostViewModel(raw);
    expect(vm.preview.length).toBe(200);
  });

  it('imageUrl is optional and forwarded when present', () => {
    const raw = { id: '1', _id: '1', title: 'T', body: 'text', author: 'alice', createdAt: '2024-01-01', imageUrl: 'http://img.png' };
    const vm = mapToPostViewModel(raw);
    expect(vm.imageUrl).toBe('http://img.png');
  });

  it('imageUrl is undefined when absent', () => {
    const raw = { id: '1', _id: '1', title: 'T', body: 'text', author: 'alice', createdAt: '2024-01-01' };
    const vm = mapToPostViewModel(raw);
    expect(vm.imageUrl).toBeUndefined();
  });
});
