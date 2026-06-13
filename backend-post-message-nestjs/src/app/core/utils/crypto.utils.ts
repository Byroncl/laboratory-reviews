import * as bcrypt from 'bcrypt';
import { AUTH_CONFIG } from '../constants/auth.constants';

export class CryptoUtils {
  static async hashPassword(
    password: string,
    rounds: number = AUTH_CONFIG.BCRYPT_ROUNDS,
  ): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  static async comparePasswords(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
