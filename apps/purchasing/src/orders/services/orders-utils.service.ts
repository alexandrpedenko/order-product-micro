import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Product, Order, PurchaseState, User } from '@core/core';
import { OrderItem } from '@core/core/models/order-item.entity';
import { ICreateOrder } from '../types';

@Injectable()
export class OrdersUtilsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) { }


  async createOrder(
    { userId, productsFromDB, productsToBuy }: ICreateOrder,
    manager: EntityManager
  ): Promise<number> {
    let totalPrice = 0;
    const items = [];
    const order = new Order({
      status: PurchaseState.Purchased,
      totalPrice,
      userId,
    });

    const savedOrder = await manager.save(order);

    for (const { id, quantity } of productsToBuy) {
      const product = productsFromDB.find(product => product.id === id);
      // NOTE: just not to fail the transaction
      if (!product) {
        continue;
      }

      const orderItem = new OrderItem({
        purchasePrice: product.price,
        quantity,
        product,
        order: savedOrder
      });
      items.push(orderItem);
      totalPrice += product.price * quantity;
    }
    savedOrder.items = items;

    await manager.save(OrderItem, items);
    await manager.update(Order, savedOrder.id, {
      totalPrice,
    });

    return totalPrice;
  }

  async getProductsAndUser(
    productIds: number[],
    userId: number
  ): Promise<{ user: User, products: Product[] }> {
    const [user, products] = await Promise.all([
      this.usersRepository.createQueryBuilder('user')
        .select(['user.id', 'user.email'])
        .where('user.id = :userId', { userId })
        .getOne(),

      this.productRepository.createQueryBuilder('product')
        .select(['product.id', 'product.name', 'product.price'])
        .whereInIds(productIds)
        .getMany()
    ]);

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (products?.length < 1) {
      throw new HttpException(
        'Products not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return { user, products };
  }
}
