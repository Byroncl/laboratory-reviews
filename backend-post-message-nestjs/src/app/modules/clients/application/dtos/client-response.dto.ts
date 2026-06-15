import { ApiProperty } from '@nestjs/swagger';
import { CLIENT_DTO_DESCRIPTIONS } from '../../constants/client.constants';

export class ClientResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: CLIENT_DTO_DESCRIPTIONS.ID,
  })
  _id: string;

  @ApiProperty({
    example: 'Jane',
    description: CLIENT_DTO_DESCRIPTIONS.NAME_RESPONSE,
  })
  name: string;

  @ApiProperty({
    example: 'Smith',
    description: CLIENT_DTO_DESCRIPTIONS.LASTNAME_RESPONSE,
  })
  lastname: string;

  @ApiProperty({
    example: 'janesmith',
    description: CLIENT_DTO_DESCRIPTIONS.USERNAME_RESPONSE,
  })
  username: string;

  @ApiProperty({
    example: 'jane@example.com',
    description: CLIENT_DTO_DESCRIPTIONS.EMAIL_RESPONSE,
  })
  email: string;

  @ApiProperty({
    example: 'standard',
    description: CLIENT_DTO_DESCRIPTIONS.TYPE_RESPONSE,
  })
  type: string;

  @ApiProperty({
    example: true,
    description: CLIENT_DTO_DESCRIPTIONS.IS_ACTIVE,
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: CLIENT_DTO_DESCRIPTIONS.CREATED_AT,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: CLIENT_DTO_DESCRIPTIONS.UPDATED_AT,
  })
  updatedAt: Date;
}
