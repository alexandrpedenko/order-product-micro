import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Category, DatabaseModule, LoggerModule, Product, Role } from '@core/core';

import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // LoggerModule
    DatabaseModule,
    DatabaseModule.forFeature([Product, Category]),
    CategoriesModule,
    OrdersModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
