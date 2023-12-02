import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AuthModule } from './auth.module';
import { RabbitService, RABBITMQ_QUEUE } from '@core/core/rabbitmq';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  const rabbitService = app.get(RabbitService);
  const loggerService = app.get(Logger);
  
  app.connectMicroservice(rabbitService.getRmqOptions(RABBITMQ_QUEUE.Auth));
  
  app.use(cookieParser());
  app.useLogger(loggerService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT_AUTH'));
}

bootstrap();
