import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  Category,
  CurrentUserGuard,
  DatabaseModule,
  ExceptionsFilter,
  LoggerModule,
  Order,
  OrderItem,
  Product,
  Role,
  User
} from '@core/core';
import { RabbitModule } from '@core/core/rabbitmq';

import { AuthController } from './controller/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './services/auth.service';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { AuthUtilsService } from './services/auth-utils.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    DatabaseModule,
    DatabaseModule.forFeature([User, Role, Order, OrderItem, Product, Category]),
    RabbitModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthUtilsService,
    JwtAuthGuard,
    CurrentUserGuard,
    JwtStrategy,
    RefreshJwtStrategy,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
  exports: [AuthService, AuthUtilsService],
})
export class AuthModule { }
