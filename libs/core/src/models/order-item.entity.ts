
import { Entity, Column, ManyToMany, JoinTable, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../database';
import { Product } from './product.entity';
import { Order } from './order.entity';


@Entity('order_items')
export class OrderItem extends AbstractEntity<OrderItem> {
  @Column()
  purchasePrice: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
} 
