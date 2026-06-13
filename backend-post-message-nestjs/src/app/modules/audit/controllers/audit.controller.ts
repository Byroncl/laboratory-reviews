import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';
import { AuditLogPageResponseDto } from '../dto/audit-log-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { HasPermission } from '../../../core/decorators/has-permission.decorator';
import { EntityType } from '../schemas/audit-log.schema';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('audits:read')
  @ApiOperation({ summary: 'Get paginated audit logs with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated audit log list', type: AuditLogPageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires audits:read permission' })
  @Get()
  async findAll(@Query() query: AuditLogQueryDto) {
    const result = await this.auditService.queryAudits(query);
    return ApiRes.success(result);
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('audits:read')
  @ApiOperation({ summary: 'Get a single audit log entry by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'AuditLog MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Audit log entry with before/after snapshots' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires audits:read permission' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const entry = await this.auditService.findOne(id);
    return ApiRes.success(entry);
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('audits:read')
  @ApiOperation({ summary: 'Get all audit logs for a specific entity' })
  @ApiParam({ name: 'entityType', enum: EntityType, description: 'Entity type' })
  @ApiParam({ name: 'id', type: 'string', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Paginated entity-scoped audit logs', type: AuditLogPageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires audits:read permission' })
  @Get('entity/:entityType/:id')
  async findByEntity(
    @Param('entityType') entityType: EntityType,
    @Param('id') id: string,
    @Query() query: AuditLogQueryDto,
  ) {
    const result = await this.auditService.findByEntity(entityType, id, query);
    return ApiRes.success(result);
  }
}
