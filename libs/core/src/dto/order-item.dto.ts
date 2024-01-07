import { IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { Order } from "../models/order.entity";
import { UserDto } from "./user.dto";
import { ProductDto } from "./product.dto";
import { OrderItem } from "../models/order-item.entity";
import { OrderDto } from "./order.dto";

export class OrderItemDto implements OrderItem {
  @IsNumber()
  id: number;

  @IsNumber()
  purchasePrice: number;

  @IsNumber()
  quantity: number;

  @Type(() => OrderDto)
  @ValidateNested()
  order: Order;

  @Type(() => ProductDto)
  @ValidateNested()
  product: ProductDto;
}
