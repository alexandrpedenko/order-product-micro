import { RmqOptions, Transport } from "@nestjs/microservices";

export const getRmqOptions = (queue: string, rabbitURL: string): RmqOptions  => {

  return {
    transport: Transport.RMQ,
    options: {
      urls: [rabbitURL],
      noAck: false,
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}
