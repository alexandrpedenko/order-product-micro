import { Module } from '@nestjs/common';

import {
  DatabaseModule,
  User,
  Order,
  Product,
  RabbitModule,
  RABBITMQ_QUEUE,
  CLIENT_PROXY_SERVICE,
  LoggerModule,
  Role,
  Category,
  OrderItem,
} from '@core/core';
import { OrdersService } from './services/orders.service';
import { OrdersUtilsService } from './services/orders-utils.service';
import { OrdersController } from './controllers/orders.controller';

@Module({
  imports: [
    // LoggerModule,
    // DatabaseModule,
    DatabaseModule.forFeature([Product, Category, User, Role, Order, OrderItem]),
    RabbitModule.register(CLIENT_PROXY_SERVICE.Auth, RABBITMQ_QUEUE.Auth),
    RabbitModule.register(CLIENT_PROXY_SERVICE.Payments, RABBITMQ_QUEUE.Payments),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersUtilsService],
})
export class OrdersModule { }
