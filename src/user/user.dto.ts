import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { RoleSchema, UserSchema } from '@generated/zod';
import { createPaginatedResponseSchema } from '@/shared/shared.dto';

const CreateUserSchema = z.lazy(() =>
  UserSchema.pick({ email: true, username: true, roleId: true }),
);

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

const UserWithRoleSchema = UserSchema.omit({ roleId: true }).merge(
  z.object({ role: z.lazy(() => RoleSchema.pick({ name: true })) }),
);

export class UserWithRoleDto extends createZodDto(UserWithRoleSchema) {}

export class PaginatedUserResponseDto extends createZodDto(
  createPaginatedResponseSchema(UserWithRoleSchema),
) {}
