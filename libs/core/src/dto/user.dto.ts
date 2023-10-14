import { RoleDto } from "./role.dto";

export class UserDto {
  id: string;
  password: string;
  email: string;
  username: string;
  roles: RoleDto[];
}