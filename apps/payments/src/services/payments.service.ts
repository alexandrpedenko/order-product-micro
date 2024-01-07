import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import { CLIENT_PROXY_SERVICE } from '@core/core';
import { PaymentsCreateChargeDto, PaymentProviders } from '@core/core';
import { StripePaymentProviderService } from '../providers';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripeProviderService: StripePaymentProviderService,
  ) { }

  async createCharge(paymentPayload: PaymentsCreateChargeDto): Promise<boolean> {
    switch (paymentPayload.paymentProvider) {
      case PaymentProviders.Stripe: {
        // TODO: check if result is successful
        const chargeIntent = await this.stripeProviderService.createCharge(paymentPayload);
        return true
      }

      case PaymentProviders.Test: {
        return true;
      }

      default:
        throw new RpcException('Payment provider not found');
    }
  }
}
