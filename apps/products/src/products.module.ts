import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import {
  Category,
  DatabaseModule,
  ExceptionsFilter,
  LoggerModule,
  Product,
  RabbitModule,
  RABBITMQ_QUEUE,
  CLIENT_PROXY_SERVICE,
} from '@core/core';

import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    DatabaseModule,
    DatabaseModule.forFeature([Product, Category]),
    RabbitModule.register(CLIENT_PROXY_SERVICE.AuthService, RABBITMQ_QUEUE.Auth),
    CategoriesModule,
    OrdersModule
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class ProductsModule { }
