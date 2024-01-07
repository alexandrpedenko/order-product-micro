import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_QUEUE, RabbitService } from '@core/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const configService = app.get(ConfigService);
  const rabbitService = app.get(RabbitService);
  const loggerService = app.get(Logger);

  app.connectMicroservice(rabbitService.getRmqOptions(RABBITMQ_QUEUE.Payments));

  app.useLogger(loggerService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT_PAYMENTS'));
}
bootstrap();

