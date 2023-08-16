import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const Activate2faRequestSchema = z.object({ otp: z.string().length(6) });

export class Activate2FARequestDTO extends createZodDto(
  Activate2faRequestSchema,
) {}
