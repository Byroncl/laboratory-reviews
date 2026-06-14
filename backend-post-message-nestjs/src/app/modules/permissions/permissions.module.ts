import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionsService } from './services/permissions.service';
import { PermissionsGateway } from './gateways/permissions.gateway';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { TranslationService } from '../../core/utils/translation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsGateway, TranslationService],
  exports: [PermissionsService, PermissionsGateway],
})
export class PermissionsModule {}
