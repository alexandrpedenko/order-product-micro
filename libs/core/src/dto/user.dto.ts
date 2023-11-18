import { IsNumber, IsString, ValidateNested } from "class-validator";
import { RoleDto } from "./role.dto";
import { Type } from "class-transformer";

export class UserDto {
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
}
