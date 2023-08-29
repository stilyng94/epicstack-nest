import { AccountSchema } from '@generated/zod';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const createWithOauthSchema = z
  .object({
    token: z.string(),
    email: z.string(),
    username: z.string().nullish(),
    subject: z.string(),
  })
  .merge(AccountSchema.pick({ provider: true }));

export class CreateWithOauthDto extends createZodDto(createWithOauthSchema) {}

export class AuthenticateWithOauthDto extends createZodDto(
  createWithOauthSchema.pick({ provider: true, token: true }),
) {}
