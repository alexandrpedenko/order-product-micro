import { NestFactory } from '@nestjs/core';
import { PurchasingModule } from './purchasing.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(PurchasingModule);
  const configService = app.get(ConfigService);
  const loggerService = app.get(Logger);

  app.useLogger(loggerService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  await app.listen(configService.get('HTTP_PORT_PURCHASING'));
}
bootstrap();
