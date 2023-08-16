import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'nestjs-zod/z';
import { UserSchema } from 'prisma/generated/zod';

const tokenPayloadSchema = z.object({
  id: z.string().cuid2(),
  is2faAuth: z.boolean().default(false),
});

export class TokenPayloadDto extends createZodDto(tokenPayloadSchema) {}

const LoginSchema = z.lazy(() =>
  UserSchema.pick({ password: true, username: true }),
);

export class LoginDto extends createZodDto(LoginSchema) {}

const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
