import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { RolesGateway } from './gateways/roles.gateway';
import { Role, RoleSchema } from './schemas/role.schema';
import { TranslationService } from '../../core/utils/translation.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { RoleRepository } from './domain/repositories/role.repository';
import { RoleMongoRepository } from './infrastructure/repositories/role-mongo.repository';
import {
  IsValidRoleNameConstraint,
  IsValidPermissionIdConstraint,
} from './validators/role-validators';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesGateway,
    TranslationService,
    I18nService,
    IsValidRoleNameConstraint,
    IsValidPermissionIdConstraint,
    {
      provide: RoleRepository,
      useClass: RoleMongoRepository,
    },
  ],
  exports: [RolesService, RolesGateway],
})
export class RolesModule {}
