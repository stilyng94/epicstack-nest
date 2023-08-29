import { UserSchema } from '@generated/zod';
import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'nestjs-zod/z';

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

const VerificationTypesSchema = z.union([
  z.literal('2fa'),
  z.literal('2fa-verify'),
  z.literal('forgot-password'),
  z.literal('registration'),
  z.literal('change-email'),
  z.literal('login'),
]);

export type VerificationTypes = z.infer<typeof VerificationTypesSchema>;

export class LoginCallbackResponseDto extends createZodDto(
  z.object({ accessToken: z.string(), refreshToken: z.string() }),
) {}
