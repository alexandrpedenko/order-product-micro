import { Module } from '@nestjs/common';

import {
  DatabaseModule,
  LoggerModule,
  Product,
  User,
  Order,
  Roles,
  CLIENT_PROXY_SERVICE,
  RABBITMQ_QUEUE,
  RabbitModule,
  Role,
} from '@core/core';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    RabbitModule.register(CLIENT_PROXY_SERVICE.Auth, RABBITMQ_QUEUE.Auth),
    RabbitModule.register(CLIENT_PROXY_SERVICE.Payments, RABBITMQ_QUEUE.Payments),
    OrdersModule
  ],
})
export class PurchasingModule { }
