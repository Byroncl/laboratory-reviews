import { ApiProperty } from '@nestjs/swagger';
import { AuditAction, EntityType, AuditStatus, AUDIT_DTO_DESCRIPTIONS } from '../../constants/audit.constants';

export class AuditLogResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: AUDIT_DTO_DESCRIPTIONS.ID,
  })
  id: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: AUDIT_DTO_DESCRIPTIONS.USER_ID,
  })
  userId: string;

  @ApiProperty({
    enum: AuditAction,
    description: AUDIT_DTO_DESCRIPTIONS.ACTION,
  })
  action: AuditAction;

  @ApiProperty({
    enum: EntityType,
    description: AUDIT_DTO_DESCRIPTIONS.ENTITY_TYPE,
  })
  entityType: EntityType;

  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: AUDIT_DTO_DESCRIPTIONS.ENTITY_ID,
  })
  entityId: string;

  @ApiProperty({
    example: { title: 'New Title' },
    nullable: true,
    description: AUDIT_DTO_DESCRIPTIONS.CHANGES,
  })
  changes?: Record<string, any>;

  @ApiProperty({
    example: { title: 'Old Title' },
    nullable: true,
    description: AUDIT_DTO_DESCRIPTIONS.BEFORE,
  })
  before?: Record<string, any>;

  @ApiProperty({
    example: { title: 'New Title' },
    nullable: true,
    description: AUDIT_DTO_DESCRIPTIONS.AFTER,
  })
  after?: Record<string, any>;

  @ApiProperty({
    enum: AuditStatus,
    description: AUDIT_DTO_DESCRIPTIONS.STATUS,
  })
  status: AuditStatus;

  @ApiProperty({
    example: '192.168.1.1',
    description: AUDIT_DTO_DESCRIPTIONS.IP_ADDRESS,
  })
  ipAddress: string;

  @ApiProperty({
    example: 'Mozilla/5.0...',
    description: AUDIT_DTO_DESCRIPTIONS.USER_AGENT,
  })
  userAgent: string;

  @ApiProperty({
    example: 'Post creado exitosamente',
    description: AUDIT_DTO_DESCRIPTIONS.MESSAGE,
  })
  message: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: AUDIT_DTO_DESCRIPTIONS.CREATED_AT,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:05:00Z',
    nullable: true,
    description: AUDIT_DTO_DESCRIPTIONS.UPDATED_AT,
  })
  updatedAt?: Date;

  @ApiProperty({
    example: 5000,
    description: AUDIT_DTO_DESCRIPTIONS.ELAPSED_TIME,
  })
  elapsedTime: number;
}
