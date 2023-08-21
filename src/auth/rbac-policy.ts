import { RolesBuilder } from 'nest-access-control';

export const Roles = {
  admin: 'admin',
  user: 'user',
} as const;

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

RBAC_POLICY.grant(Roles.user)
  .readOwn('profile')
  .grant(Roles.admin)
  .extend(Roles.user)
  .lock();
