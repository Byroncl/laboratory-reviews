import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoUtils } from '../../../core/utils/crypto.utils';
import { JwtPayload, LoginResponse } from '../../../core/interfaces/auth.interface';
import { AuthRole } from '../../../core/types/common.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await CryptoUtils.comparePasswords(pass, user.password_hash))) {
      const { password_hash, ...result } = user.toObject
        ? user.toObject()
        : (user as any);
      return result;
    }
    return null;
  }

  async login(user: any): Promise<LoginResponse> {
    const payload: JwtPayload = {
      username: user.username,
      sub: user._id,
      type: (user.type as AuthRole) || 'user',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
