import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule, RabbitModule } from '@core/core';

import { PaymentsService } from './services';
import { PaymentsController } from './controllers';
import { StripePaymentProviderService } from './providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    RabbitModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripePaymentProviderService],
})
export class PaymentsModule { }
