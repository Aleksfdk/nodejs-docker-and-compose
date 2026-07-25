import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  @Length(1, 250)
  name: string;

  @Length(0, 1500)
  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsInt({ each: true })
  items: number[];
}
