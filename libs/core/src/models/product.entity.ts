
import { Entity, Column, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../database';
import { Category } from './category.entity';


@Entity('products')
export class Product extends AbstractEntity<Product> {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float', default: 5 })
  rating: number;

  @ManyToOne(() => Category, (category) => category.id)
  category: Category;

  @Column({ nullable: true })
  image?: string;
} 
