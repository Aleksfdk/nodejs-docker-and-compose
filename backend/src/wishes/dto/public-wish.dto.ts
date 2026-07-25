import { User } from '../../users/entities/user.entity';

export class PublicWishDto {
  id: number;
  name: string;
  link: string;
  image: string;
  price: number;
  description: string;
  raised: number;
  owner: User;
  copied: number;
}
