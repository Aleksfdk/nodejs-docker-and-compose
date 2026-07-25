import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Имя пользователя должно быть не менее 2 символов' })
  @MaxLength(30, {
    message: 'Имя пользователя не должно превышать 30 символов',
  })
  username: string;

  @IsString()
  @MinLength(3, { message: 'Пароль должен быть не менее 3 символов' })
  password: string;

  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'О себе — не более 200 символов' })
  about?: string;

  @IsUrl({}, { message: 'Ссылка на аватар должна быть корректным URL' })
  @IsOptional()
  avatar?: string;
}
