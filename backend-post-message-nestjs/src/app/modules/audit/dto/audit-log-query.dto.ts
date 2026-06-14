import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction, EntityType, AUDIT_PAGINATION, AUDIT_DTO_DESCRIPTIONS } from '../constants/audit.constants';

export class AuditLogQueryDto {
  @ApiPropertyOptional({ default: AUDIT_PAGINATION.DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = AUDIT_PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({ default: AUDIT_PAGINATION.DEFAULT_LIMIT, minimum: 1, maximum: AUDIT_PAGINATION.MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(AUDIT_PAGINATION.MAX_LIMIT)
  limit: number = AUDIT_PAGINATION.DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: AUDIT_DTO_DESCRIPTIONS.FILTER_USER_ID })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: EntityType })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ description: AUDIT_DTO_DESCRIPTIONS.FROM })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: AUDIT_DTO_DESCRIPTIONS.TO })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ description: AUDIT_DTO_DESCRIPTIONS.SEARCH })
  @IsOptional()
  @IsString()
  search?: string;
}
