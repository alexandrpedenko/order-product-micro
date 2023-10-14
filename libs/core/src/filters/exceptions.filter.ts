import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';

type ExceptionObjectResponse = {
  message: string | string[];
};

type ResponseBody = {
  message: string | string[];
  statusCode: number;
};

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  context: HttpArgumentsHost;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    this.context = host.switchToHttp();

    if (exception instanceof HttpException) {
      return this.buildHttpExceptionResponse(exception);
    }

    return this.buildDefaultResponse(exception);
  }

  private buildHttpExceptionResponse(exception: HttpException): void {
    const httpStatus = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message = (<ExceptionObjectResponse>exceptionResponse).message
      ? (<ExceptionObjectResponse>exceptionResponse).message
      : exception.message;

    const responseBody: ResponseBody = {
      message,
      statusCode: httpStatus,
    };

    this.reply(responseBody, httpStatus);
  }

  private buildDefaultResponse(exception: Error): void {
    const responseBody: ResponseBody = {
      message: exception.message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    this.reply(responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private reply(responseBody: ResponseBody, httpStatus: number) {
    const { httpAdapter } = this.httpAdapterHost;
    httpAdapter.reply(this.context.getResponse(), responseBody, httpStatus);
  }
}
