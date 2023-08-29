import { UserWithRoleDto } from '@/user/user.dto';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ACGuard } from 'nest-access-control';

@Injectable()
export class AcRoleGuardGuard extends ACGuard {
  protected async getUserRoles(
    context: ExecutionContext,
  ): Promise<string | string[]> {
    const user = (await this.getUser(context)) as unknown as UserWithRoleDto;
    return user.role.name;
  }
}
