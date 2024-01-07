import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { EntityManager, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { CLIENT_PROXY_SERVICE, Order, PaymentsCommands, PaymentsCreateChargeDto } from '@core/core';
import { UpdateOrderDto, OrderProductsDto } from '../dto';
import { OrdersUtilsService } from './orders-utils.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @Inject(CLIENT_PROXY_SERVICE.Payments) private readonly paymentsClient: ClientProxy,
    private readonly orderUtilsService: OrdersUtilsService,
  ) { }

  async purchaseProduct({
    paymentProvider,
    productsToBuy,
    address,
    userId,
    card,
  }: OrderProductsDto): Promise<{ message: string }> {
    const productIds = productsToBuy.map(detail => detail.id);
    const { user, products } = await this.orderUtilsService.getProductsAndUser(productIds, userId);

    return await this.entityManager.transaction(async manager => {
      const totalPrice = await this.orderUtilsService.createOrder(
        {
          userId: user.id,
          productsToBuy,
          productsFromDB: products,
        },
        manager
      );

      const paymentChargeResult = await firstValueFrom(
        this.paymentsClient
          .send<boolean, PaymentsCreateChargeDto>(
            { cmd: PaymentsCommands.createCharge },
            {
              email: user.email,
              card,
              address,
              totalPrice,
              paymentProvider,
            }
          )
      );

      if (!paymentChargeResult) {
        return new HttpException(
          'Error processing payment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { message: 'Products ordered successfully' };
    });
  }


  async findOrdersByUserId(userId: number): Promise<Order[]> {
    return await this.entityManager.find<Order>(Order, {
      where: { userId },
      relations: ['items', 'items.product']
    });
  }

  async findOneOrder(id: number, userId: number): Promise<Order> {
    return this.entityManager.findOne<Order>(Order, {
      where: { id, userId },
      relations: ['items', 'items.product']
    });
  }

  async deleteOrder(id: number, userId: number): Promise<void> {
    const order = await this.findOneOrder(id, userId);

    if (order) {
      const deleteResult = await this.entityManager.remove<Order>(order);

      if (!deleteResult) {
        throw new NotFoundException(`12Order with ID ${id} not found`);
      }
      return;
    }

    throw new NotFoundException(`14 Order with ID ${id} not found`);
  }
}
