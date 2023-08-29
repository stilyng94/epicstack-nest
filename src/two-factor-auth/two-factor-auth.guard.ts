import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserWithRoleDto } from '@/user/user.dto';

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!(req.user as unknown as UserWithRoleDto).isTwoFactorAuthEnabled) {
      return true;
    }
    return Boolean(req['is2faAuth']);
  }
}
