import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
  @IsNotEmpty({ message: 'Post ID is required' })
  @IsMongoId({ message: 'Post ID must be a valid MongoDB ID' })
  postId: string;
}
