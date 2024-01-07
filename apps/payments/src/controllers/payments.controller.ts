import { Controller, Get } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import { PaymentsCreateChargeDto } from '../dto';
import { PaymentsService } from '../services/payments.service';
import { PaymentsCommands, RabbitService } from '@core/core';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly rabbitmqService: RabbitService,
  ) { }

  @MessagePattern({ cmd: PaymentsCommands.createCharge })
  async createCharge(
    @Ctx() context: RmqContext,
    @Payload() data: PaymentsCreateChargeDto
  ) {
    this.rabbitmqService.ackMessage(context);
    return this.paymentsService.createCharge(data);
  }

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
