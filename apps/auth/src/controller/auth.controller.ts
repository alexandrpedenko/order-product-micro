import {
  Controller,
  Body,
  Post,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { GetCurrentUserDta, Serialize } from '@core/core';

import { AuthResponseDto } from '../dto/response';
import { CreateUserDto, LogInUserDto } from '../dto/request';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard, JwtRefreshAuthGuard } from '../guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // NOTE: Test endpoint for getting user
  @Get('user/:id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.authService.getUser(id);
  }

  @Post('register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    return await this.authService.registerUser(createUserDto);
  }

  @Serialize(AuthResponseDto)
  @Post('login')
  async logInUser(
    @Body() logInUserDto: LogInUserDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.login(logInUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logoutUser(
    @GetCurrentUserDta('id') id: number,
  ): Promise<{ message: string }> {
    return await this.authService.logout(id);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetCurrentUserDta('refreshToken') refreshToken: string,
    @GetCurrentUserDta('id') id: number,
  ) {
    return await this.authService.regenerateRefreshToken(id, refreshToken);
  }
}
