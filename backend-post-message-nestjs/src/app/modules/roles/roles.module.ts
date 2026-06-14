import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { RolesGateway } from './gateways/roles.gateway';
import { Role, RoleSchema } from './schemas/role.schema';
import { TranslationService } from '../../core/utils/translation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesGateway, TranslationService],
  exports: [RolesService, RolesGateway],
})
export class RolesModule {}
