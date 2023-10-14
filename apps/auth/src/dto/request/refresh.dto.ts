import { IsString } from 'class-validator';

export class RefreshRequestDto {
  @IsString()
  id: string;

  @IsString()
  refreshToken: string;
}
