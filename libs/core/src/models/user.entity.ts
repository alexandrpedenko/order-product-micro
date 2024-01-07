import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

import { AbstractEntity } from '../database';
import { Role } from './role.entity';
import { Order } from './order.entity';

@Entity('users')
export class User extends AbstractEntity<User> {
  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Order, order => order.userId, {
    cascade: ['remove']
  })
  orders?: Order[];
}
