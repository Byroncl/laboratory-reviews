import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '../schemas/audit-log.schema';
import { AUDIT_DTO_DESCRIPTIONS } from '../constants/audit.constants';

export class AuditLogPageResponseDto {
  @ApiProperty({ type: [Object], description: AUDIT_DTO_DESCRIPTIONS.DATA })
  data: AuditLog[];

  @ApiProperty({ example: 142, description: AUDIT_DTO_DESCRIPTIONS.TOTAL })
  total: number;

  @ApiProperty({ example: 1, description: AUDIT_DTO_DESCRIPTIONS.PAGE })
  page: number;

  @ApiProperty({ example: 20, description: AUDIT_DTO_DESCRIPTIONS.LIMIT })
  limit: number;

  @ApiProperty({ example: 8, description: AUDIT_DTO_DESCRIPTIONS.TOTAL_PAGES })
  totalPages: number;
}
