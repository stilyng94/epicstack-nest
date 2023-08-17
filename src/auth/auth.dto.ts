import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'nestjs-zod/z';
import { UserSchema } from 'prisma/generated/zod';

const tokenPayloadSchema = z.object({
  id: z.string().cuid2(),
  is2faAuth: z.boolean().default(false).optional(),
});

export class TokenPayloadDto extends createZodDto(tokenPayloadSchema) {}

const LoginSchema = z.lazy(() => UserSchema.pick({ email: true }));

export class LoginDto extends createZodDto(LoginSchema) {}

const LoginResponseSchema = z.object({
  message: z.string(),
});

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
