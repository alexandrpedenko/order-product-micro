import { IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { CategoryDto } from "./category.dto";
import { Product } from "../models";

export class ProductDto implements Product {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @Min(1)
  @Max(5)
  @IsNumber()
  rating: number;

  @Type(() => CategoryDto)
  @ValidateNested()
  category: CategoryDto;

  @IsOptional()
  @IsString()
  image?: string;
}