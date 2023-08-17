import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().describe('Port number'),
  REFRESH_TOKEN_SECRET: z.string(),
  JWT_SECRET: z.string(),
  ENV: z.union([z.literal('development'), z.literal('production')]),
  SENTRY_DSN: z.string(),
  GOOGLE_AUTH_CLIENT_ID: z.string(),
  GOOGLE_AUTH_CLIENT_SECRET: z.string(),
});

export const EnvConfigApi = zodToOpenAPI(EnvConfigSchema);

export class EnvConfigDto extends createZodDto(EnvConfigSchema) {}
