import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const VerificationSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  /**
   * The type of verification, e.g. "email" or "phone"
   */
  type: z.union([z.literal('email'), z.literal('phone')]),
  /**
   * The thing we're trying to verify, e.g. a user's email or phone number
   */
  target: z.union([z.literal('email'), z.literal('phone')]),
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
  /**
   * When it's safe to delete this verification
   */
  expiresAt: z.date().nullish(),
})

export class VerificationDto extends createZodDto(VerificationSchema) {
}
