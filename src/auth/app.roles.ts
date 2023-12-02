import { RolesBuilder } from 'nest-access-control';

export const AppRoles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

RBAC_POLICY
  // user
  .grant(AppRoles.USER)
  .readOwn(['user', 'streamFile'])
  .createOwn(['docs'])
  // admin
  .grant(AppRoles.ADMIN)
  .extend(AppRoles.USER)
  .createAny('docs')
  .readAny(['docs', 'user'])
  .lock();
