import { IsUrl, Length, IsNumber, Min } from 'class-validator';

export class CreateWishDto {
  @Length(1, 250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1, { message: 'Цена должна быть не менее 1 рубля' })
  price: number;

  @Length(1, 1024)
  description: string;
}
