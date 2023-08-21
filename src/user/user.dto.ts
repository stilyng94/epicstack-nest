import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { UserSchema } from 'prisma/generated/zod';

const CreateUserSchema = z.lazy(() =>
  UserSchema.pick({ email: true, username: true }),
);

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
