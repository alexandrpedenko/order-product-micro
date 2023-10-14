import { UseInterceptors } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { SerializerInterceptor } from '../interceptors/serialize.interceptor';

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializerInterceptor(dto));
}
