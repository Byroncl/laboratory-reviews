import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './domain/repositories/user.repository';
import { UserMongoRepository } from './infrastructure/repositories/user-mongo.repository';
import { CreateUserUseCase } from './domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from './domain/use-cases/find-all-users.use-case';
import { FindUserByUsernameUseCase } from './domain/use-cases/find-user-by-username.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByUsernameUseCase,
    {
      provide: UserRepository,
      useClass: UserMongoRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
