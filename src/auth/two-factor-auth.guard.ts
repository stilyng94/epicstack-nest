import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ApiUserDto } from '../user/user.dto';

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    return (
      (req.user as unknown as ApiUserDto).isTwoFactorAuthEnabled &&
      req['is2faAuth']
    );
  }
}
