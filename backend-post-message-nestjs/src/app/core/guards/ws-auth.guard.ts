import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient();
      const token = client.handshake?.auth?.token as string | undefined;

      if (!token) return false;

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.username = payload.username;

      return true;
    } catch {
      return false;
    }
  }
}
