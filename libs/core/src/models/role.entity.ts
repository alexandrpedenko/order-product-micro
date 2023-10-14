import { AbstractEntity } from '../database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Role extends AbstractEntity<Role> {
  @Column()
  name: string;
}
