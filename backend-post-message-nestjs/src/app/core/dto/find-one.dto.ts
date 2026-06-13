import { IsMongoId, IsNotEmpty } from 'class-validator';

export class FindOneDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
