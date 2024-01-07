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
  User,
  Order,
  Role,
  OrderItem,
} from '@core/core';

import { ProductsController } from './products/controllers';
import { ProductsService } from './products/services/products.service';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    DatabaseModule,
    DatabaseModule.forFeature([Product, Category, User, Role, Order, OrderItem]),
    RabbitModule.register(CLIENT_PROXY_SERVICE.Auth, RABBITMQ_QUEUE.Auth),
    CategoriesModule,
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
