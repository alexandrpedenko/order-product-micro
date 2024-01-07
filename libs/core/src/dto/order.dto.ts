import { IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { Order } from "../models/order.entity";
import { UserDto } from "./user.dto";
import { OrderItemDto } from "./order-item.dto";

export class OrderDto implements Order {
  @IsNumber()
  id: number;

  @Min(1)
  @IsNumber()
  totalPrice: number;

  @Type(() => OrderItemDto)
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @IsNumber()
  userId: number;

  @IsString()
  status: string;

  @IsString()
  createdAt: Date;

  @IsOptional()
  @IsString()
  updatedAt?: Date;
}
