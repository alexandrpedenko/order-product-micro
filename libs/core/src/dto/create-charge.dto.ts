import { CardDto } from '@core/core';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentProviders } from '../enums';

export class PaymentsCreateChargeDto {
  @IsString()
  @IsEnum(PaymentProviders)
  paymentProvider: string;

  @IsEmail()
  email: string;

  @IsNumber()
  totalPrice: number;

  @IsString()
  address: string;

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}