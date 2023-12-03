import { UserSchema, VerificationTokenSchema } from '@/prisma/generated/zod';
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

const VerificationTypesSchema = VerificationTokenSchema.pick({
  type: true,
});

export type VerificationTypes = z.infer<typeof VerificationTypesSchema>['type'];

export class LoginCallbackResponseDto extends createZodDto(
  z.object({ accessToken: z.string(), refreshToken: z.string() }),
) {}
