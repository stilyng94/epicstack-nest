import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().describe('Port number'),
  REFRESH_TOKEN_SECRET: z.string(),
  JWT_SECRET: z.string(),
  ENV: z.union([z.literal('development'), z.literal('production')]),
  SENTRY_DSN: z.string(),
  GOOGLE_AUTH_CLIENT_ID: z.string(),
  GOOGLE_AUTH_CLIENT_SECRET: z.string(),
  DEFAULT_FROM_ADDRESS: z.string().toLowerCase().email(),
  DEFAULT_FROM_NAME: z.string(),
  MAIL_AUTH_USER: z.string().default(''),
  MAIL_AUTH_PASSWORD: z.string().default(''),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_SECURE: z.coerce.number().transform<boolean>((arg) => Boolean(arg)),
  TYPESENSE_API_KEY: z.string(),
  TYPESENSE_HOST: z.string().default('localhost'),
  TYPESENSE_PROTOCOL: z
    .union([z.literal('http'), z.literal('https')])
    .default('http'),
  TYPESENSE_PORT: z.coerce.number().int().positive().describe('Typesense port'),
});

export class EnvConfigDto extends createZodDto(EnvConfigSchema) {}
