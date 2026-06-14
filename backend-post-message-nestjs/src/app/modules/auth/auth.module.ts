import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthGuard } from '../../core/guards/auth.guard';
import { TranslationService } from '../../core/utils/translation.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthRepository } from './domain/repositories/auth.repository';
import { AuthUserRepository } from './infrastructure/repositories/auth-user.repository';
import { ValidateUserUseCase } from './domain/use-cases/validate-user.use-case';
import { LoginUseCase } from './domain/use-cases/login.use-case';
import { AUTH_CONFIG } from '../../core/constants/auth.constants';
import { IsValidUsernameConstraint, IsValidPasswordConstraint } from './validators/auth-validators';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          AUTH_CONFIG.JWT_SECRET,
        ),
        signOptions: { expiresIn: AUTH_CONFIG.JWT_EXPIRATION },
      }),
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthGuard,
    TranslationService,
    I18nService,
    ValidateUserUseCase,
    LoginUseCase,
    IsValidUsernameConstraint,
    IsValidPasswordConstraint,
    {
      provide: AuthRepository,
      useClass: AuthUserRepository,
    },
  ],
  controllers: [AuthController],
  exports: [JwtModule, AuthGuard],
})
export class AuthModule {}
