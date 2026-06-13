import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './domain/repositories/user.repository';
import { UserMongoRepository } from './infrastructure/repositories/user-mongo.repository';
import { CreateUserUseCase } from './domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from './domain/use-cases/find-all-users.use-case';
import { FindAllUsersPaginatedUseCase } from './domain/use-cases/find-all-users-paginated.use-case';
import { FindUserByUsernameUseCase } from './domain/use-cases/find-user-by-username.use-case';
import { FindUserByIdUseCase } from './domain/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from './domain/use-cases/update-user.use-case';
import { RemoveUserUseCase } from './domain/use-cases/remove-user.use-case';
import { UpdateLanguagePreferenceUseCase } from './domain/use-cases/update-language-preference.use-case';
import { AssignRoleUseCase } from './domain/use-cases/assign-role.use-case';
import { I18nService } from '../../core/i18n/i18n.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindAllUsersPaginatedUseCase,
    FindUserByUsernameUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase,
    UpdateLanguagePreferenceUseCase,
    AssignRoleUseCase,
    I18nService,
    {
      provide: UserRepository,
      useClass: UserMongoRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
