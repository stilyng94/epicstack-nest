import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { UserSchema } from 'prisma/generated/zod';

const CreateUserSchema = z.lazy(() =>
  UserSchema.pick({ email: true, name: true, password: true, username: true }),
);

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

const ApiUserSchema = z.lazy(() =>
  UserSchema.omit({ password: true, twoFactorAuthSecret: true }),
);

export class ApiUserDto extends createZodDto(ApiUserSchema) {}
