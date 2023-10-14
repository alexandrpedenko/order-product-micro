import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class CurrentUserGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const requestParam = context.switchToHttp().getRequest().params;
    if (err || !user || !requestParam) {
      throw err || new UnauthorizedException();
    }
    if (user.id !== requestParam.userId) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
