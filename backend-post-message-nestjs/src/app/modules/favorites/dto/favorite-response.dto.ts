import { PostResponseDto } from '../../posts/dto/post-response.dto';

export class FavoriteResponseDto {
  _id: string;
  clientId: string;
  postId: string;
  post?: PostResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
