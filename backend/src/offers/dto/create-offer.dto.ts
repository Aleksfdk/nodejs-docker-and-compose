import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Сумма взноса должна быть больше нуля' })
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;

  @IsNumber()
  itemId: number;
}
