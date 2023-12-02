import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';

import { AuthCommands, CLIENT_PROXY_SERVICE } from '../rabbitmq';
import { UserDto } from '../dto';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject(CLIENT_PROXY_SERVICE.AuthService) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerJwt = request.headers?.authorization as string;

    if (!bearerJwt) {
      throw new UnauthorizedException();
    }

    const jwt = bearerJwt.split(' ')[1];
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    return this.authClient
      .send<{ user: UserDto }>({ cmd: AuthCommands.authenticate }, {
        jwt,
      })
      .pipe(
        catchError(() => {
          this.logger.error('Error while validating JWT on auth service');
          throw new UnauthorizedException();
        }),
        tap(({ user }) => {

          // NOTE: Check if the user has the required roles
          if (roles) {
            for (const role of roles) {
              for (const userRole of user.roles) {
                if (userRole.name === role) {
                  return true;
                }
              }
            }

            this.logger.error('The user does not have valid roles');
            throw new HttpException('You do not have permission', HttpStatus.FORBIDDEN);
          }
        }),
        map(() => true),
      );
  }
}
