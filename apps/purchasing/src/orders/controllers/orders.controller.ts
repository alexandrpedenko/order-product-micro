import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard, Roles, UserRoles } from '@core/core';

import { OrderProductsDto } from '../dto';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('buy-product')
  @UseGuards(AuthGuard)
  @Roles(UserRoles.Customer)
  buyProduct(@Body() buyProductDto: OrderProductsDto) {
    return this.ordersService.purchaseProduct(buyProductDto);
  }

  @Get('user/:id')
  findOrdersByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOrdersByUserId(id);
  }

  @Get(':id/user/:userId')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.ordersService.findOneOrder(id, userId);
  }

  @Delete(':id/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeOrderByIdAndUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.ordersService.deleteOrder(id, userId);
  }
}
