import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from '../models';

export class RoleDto implements Role {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
