import { PartialType } from '@nestjs/mapped-types';
import { OrderProductsDto } from './order-products.dto';

export class UpdateOrderDto extends PartialType(OrderProductsDto) { }
