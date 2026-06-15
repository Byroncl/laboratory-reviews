// pipes/user-badge.pipe.spec.ts
import { UserBadgePipe } from './user-badge.pipe';
import { IUserProfile } from '../interfaces';

describe('UserBadgePipe', () => {
  let pipe: UserBadgePipe;

  beforeEach(() => {
    pipe = new UserBadgePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null input', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return "Name Lastname" when no role is present', () => {
    const user: IUserProfile = {
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
    };
    expect(pipe.transform(user)).toBe('John Doe');
  });

  it('should append the role in parentheses when present', () => {
    const user: IUserProfile = {
      name: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
      username: 'janesmith',
      role: 'Admin',
    };
    expect(pipe.transform(user)).toBe('Jane Smith (Admin)');
  });

  it('should trim the name correctly when lastname has extra spaces', () => {
    const user: IUserProfile = {
      name: 'Alice',
      lastname: 'Walker',
      email: 'alice@example.com',
      username: 'alicewalker',
    };
    expect(pipe.transform(user)).toBe('Alice Walker');
  });

  it('should handle a user with only a name and empty lastname', () => {
    const user: IUserProfile = {
      name: 'SingleName',
      lastname: '',
      email: 'single@example.com',
      username: 'single',
    };
    // trim() handles the trailing space when lastname is empty
    expect(pipe.transform(user)).toBe('SingleName');
  });
});
