import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../database/abstract.entity';
import { Product } from './product.entity';

@Entity('categories')
export class Category extends AbstractEntity<Category> {
  @Column()
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];
}
