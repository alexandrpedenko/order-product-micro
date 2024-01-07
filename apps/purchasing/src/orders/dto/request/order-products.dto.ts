import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CardDto, PaymentProviders } from '@core/core';

class ProductDto {
  @IsNumber()
  id: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class OrderProductsDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => ProductDto)
  productsToBuy: ProductDto[];

  @IsDefined()
  userId: number;

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;

  @IsString()
  @IsEnum(PaymentProviders)
  paymentProvider: string;

  @IsString()
  address: string;
}
