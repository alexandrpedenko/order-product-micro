import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;
}

export class AuthResponseDto {
  @IsString()
  @Expose()
  accessToken: string;

  @IsString()
  @Expose()
  refreshToken: string;
}
