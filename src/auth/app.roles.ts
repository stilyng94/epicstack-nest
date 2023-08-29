import { RolesBuilder } from 'nest-access-control';

export const AppRoles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

RBAC_POLICY
  // user
  .grant(AppRoles.USER)
  .readAny(['user'])
  .createOwn(['uploadDoc'])
  .readOwn(['streamFile'])
  // admin
  .grant(AppRoles.ADMIN)
  .extend(AppRoles.USER)
  .readAny(['streamFile'])
  .lock();
