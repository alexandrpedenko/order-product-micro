import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { RoleDto } from "./role.dto";
import { Type } from "class-transformer";
import { Order, User } from "../models";

export class UserDto implements User {
  @IsNumber()
  id: number;

  @IsString()
  password: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @Type(() => RoleDto)
  @ValidateNested()
  roles: RoleDto[];

  @IsArray()
  orders?: Order[];
}
