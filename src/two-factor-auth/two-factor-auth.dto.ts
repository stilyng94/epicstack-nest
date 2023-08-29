import { VerificationTokenSchema } from '@generated/zod';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const Activate2faRequestSchema = VerificationTokenSchema.pick({
  type: true,
  target: true,
}).merge(z.object({ code: z.string().length(6) }));

export class OtpRequestDTO extends createZodDto(Activate2faRequestSchema) {}

export class Generate2faResponseDto extends createZodDto(
  z.object({
    qrCode: z.string(),
    otpUri: z.string().url(),
  }),
) {}
