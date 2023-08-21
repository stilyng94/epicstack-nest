import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const VerificationTokenSchema = z.object({
  id: z.string().cuid2(),
  /**
   * The type of verification, e.g. "email" or "phone number"
   */
  target: z.string(),
  type: z.union([z.literal('2fa'), z.literal('2fa-verify'), z.literal('forgot-password'), z.literal('onboarding'), z.literal('login'), z.literal('change-email')]),
  /**
   * When it's safe to delete this verification
   */
  expiresAt: z.date().nullish(),
  createdAt: z.date(),
  /**
   * The secret key used to generate the otp
   */
  secret: z.string(),
  /**
   * The algorithm used to generate the otp
   */
  algorithm: z.string(),
  /**
   * The number of digits in the otp
   */
  digits: z.number().int(),
  /**
   * The number of seconds the otp is valid for
   */
  period: z.number().int(),
})

export class VerificationTokenDto extends createZodDto(VerificationTokenSchema) {
}
