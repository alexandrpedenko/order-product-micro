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
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import { GetCurrentUserDta, Serialize } from '@core/core';
import { AuthCommands } from '@core/core/rabbitmq';

import { AuthResponseDto } from '../dto/response';
import { CreateUserDto, LogInUserDto } from '../dto/request';
import { JwtAuthGuard, JwtRefreshAuthGuard } from '../guards';
import { AuthService } from '../services/auth.service';
import { AuthUtilsService } from '../services/auth-utils.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authUtilsService: AuthUtilsService,
  ) { }

  // NOTE: Test endpoint for getting user
  @Get('user/:id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.authService.getUser(id);
  }

  // NOTE: Test returning user to products service
  @MessagePattern({ cmd: AuthCommands.getUser })
  async getUserById(
    // @Ctx() context: RmqContext,
    @Payload() user: { id: number },
  ) {
    return await this.authService.getUserForAnotherService(user.id);
  }

  // NOTE: AUTH Endpoint
  @MessagePattern({ cmd: AuthCommands.authenticate })
  async authenticate(@Payload() data: { jwt: string }) {
    return this.authUtilsService.verifyJwt(data.jwt);
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
