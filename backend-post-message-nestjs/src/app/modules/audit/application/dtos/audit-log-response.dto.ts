import { ApiProperty } from '@nestjs/swagger';
import { AuditAction, EntityType, AuditStatus } from '../../constants/audit.constants';

export class AuditLogResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único del registro de auditoría',
  })
  id: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID del usuario que realizó la acción',
  })
  userId: string;

  @ApiProperty({
    enum: AuditAction,
    description: 'Acción realizada',
  })
  action: AuditAction;

  @ApiProperty({
    enum: EntityType,
    description: 'Tipo de entidad afectada',
  })
  entityType: EntityType;

  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'ID de la entidad afectada',
  })
  entityId: string;

  @ApiProperty({
    example: { title: 'New Title' },
    nullable: true,
    description: 'Cambios realizados',
  })
  changes?: Record<string, any>;

  @ApiProperty({
    example: { title: 'Old Title' },
    nullable: true,
    description: 'Estado anterior',
  })
  before?: Record<string, any>;

  @ApiProperty({
    example: { title: 'New Title' },
    nullable: true,
    description: 'Estado posterior',
  })
  after?: Record<string, any>;

  @ApiProperty({
    enum: AuditStatus,
    description: 'Estado de la acción',
  })
  status: AuditStatus;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'Dirección IP del cliente',
  })
  ipAddress: string;

  @ApiProperty({
    example: 'Mozilla/5.0...',
    description: 'User Agent del cliente',
  })
  userAgent: string;

  @ApiProperty({
    example: 'Post creado exitosamente',
    description: 'Mensaje descriptivo',
  })
  message: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:05:00Z',
    nullable: true,
    description: 'Fecha de actualización',
  })
  updatedAt?: Date;

  @ApiProperty({
    example: 5000,
    description: 'Tiempo transcurrido en milisegundos',
  })
  elapsedTime: number;
}
