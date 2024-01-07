
import { Entity, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../database';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { PurchaseState } from '../enums';

@Entity('orders')
export class Order extends AbstractEntity<Order> {
  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'varchar', length: 50, default: PurchaseState.WaitingForPayment })
  status: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: ['remove'] })
  items: OrderItem[];

  @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
} 
