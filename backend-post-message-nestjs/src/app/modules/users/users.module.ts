import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersGateway } from './gateways/users.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Comment, CommentSchema } from '../comments/schemas/comment.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
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
import { ChangePasswordUseCase } from './domain/use-cases/change-password.use-case';
import { ActivateUserUseCase } from './domain/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from './domain/use-cases/deactivate-user.use-case';
import { GetUserStatsUseCase } from './domain/use-cases/get-user-stats.use-case';
import { I18nService } from '../../core/i18n/i18n.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersGateway,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindAllUsersPaginatedUseCase,
    FindUserByUsernameUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase,
    UpdateLanguagePreferenceUseCase,
    AssignRoleUseCase,
    ChangePasswordUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    GetUserStatsUseCase,
    I18nService,
    {
      provide: UserRepository,
      useClass: UserMongoRepository,
    },
  ],
  exports: [UsersService, UsersGateway, UserRepository],
})
export class UsersModule {}
