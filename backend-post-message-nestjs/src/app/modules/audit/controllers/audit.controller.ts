import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';
import { AuditLogPageResponseDto } from '../dto/audit-log-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { HasPermission } from '../../../core/decorators/has-permission.decorator';
import { EntityType } from '../schemas/audit-log.schema';
import {
  AUDIT_SWAGGER,
  AUDIT_RESPONSE_DESCRIPTIONS,
  AUDIT_PARAM_DESCRIPTIONS,
} from '../constants/audit.constants';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('audits:read')
  @ApiOperation({ summary: AUDIT_SWAGGER.LOGS_ENDPOINT.SUMMARY })
  @ApiResponse({
    status: 200,
    description: AUDIT_RESPONSE_DESCRIPTIONS.SUCCESS_200,
    type: AuditLogPageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: AUDIT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @ApiResponse({
    status: 403,
    description: AUDIT_RESPONSE_DESCRIPTIONS.FORBIDDEN,
  })
  @Get()
  async findAll(@Query() query: AuditLogQueryDto) {
    const result = await this.auditService.queryAudits(query);
    return ApiRes.success(result);
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('audits:read')
  @ApiOperation({ summary: AUDIT_SWAGGER.LOG_BY_ID_ENDPOINT.SUMMARY })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: AUDIT_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: AUDIT_RESPONSE_DESCRIPTIONS.SUCCESS_SINGLE,
  })
  @ApiResponse({
    status: 401,
    description: AUDIT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @ApiResponse({
    status: 403,
    description: AUDIT_RESPONSE_DESCRIPTIONS.FORBIDDEN,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const entry = await this.auditService.findOne(id);
    return ApiRes.success(entry);
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('audits:read')
  @ApiOperation({ summary: AUDIT_SWAGGER.LOGS_BY_ENTITY_ENDPOINT.SUMMARY })
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: AUDIT_PARAM_DESCRIPTIONS.ENTITY_TYPE,
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: AUDIT_PARAM_DESCRIPTIONS.ENTITY_ID,
  })
  @ApiResponse({
    status: 200,
    description: AUDIT_RESPONSE_DESCRIPTIONS.SUCCESS_ENTITY,
    type: AuditLogPageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: AUDIT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @ApiResponse({
    status: 403,
    description: AUDIT_RESPONSE_DESCRIPTIONS.FORBIDDEN,
  })
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
