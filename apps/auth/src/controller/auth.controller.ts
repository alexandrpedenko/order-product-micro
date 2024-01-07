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
  Delete,
} from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import { CurrentUserGuard, GetCurrentUserDta, Serialize } from '@core/core';
import { AuthCommands, RabbitService } from '@core/core/rabbitmq';

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
    private readonly rabbitmqService: RabbitService
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
    @Ctx() context: RmqContext,
    @Payload() user: { id: number },
  ) {
    this.rabbitmqService.ackMessage(context);
    return await this.authService.getUserForAnotherService(user.id);
  }

  // NOTE: AUTH Endpoint
  @MessagePattern({ cmd: AuthCommands.authenticate })
  async authenticate(
    @Ctx() context: RmqContext,
    @Payload() data: { jwt: string }
  ) {
    this.rabbitmqService.ackMessage(context);
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

  @UseGuards(JwtAuthGuard)
  @Delete('delete-user/:userId')
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<{ message: string }> {
    return await this.authService.deleteUser(userId);
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
