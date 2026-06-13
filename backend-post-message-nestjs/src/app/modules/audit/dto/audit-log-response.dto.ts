import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '../schemas/audit-log.schema';

export class AuditLogPageResponseDto {
  @ApiProperty({ type: [Object], description: 'Array of audit log entries' })
  data: AuditLog[];

  @ApiProperty({ example: 142 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 8 })
  totalPages: number;
}
