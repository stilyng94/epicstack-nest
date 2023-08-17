import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const VerificationTokenSchema = z.object({
  id: z.string().cuid2(),
  /**
   * The thing we're trying to verify, e.g. a user's email or phone number
   */
  target: z.union([z.literal('email'), z.literal('phone')]),
  token: z.string(),
  /**
   * When it's safe to delete this verification
   */
  expiresAt: z.date().nullish(),
  createdAt: z.date(),
})

export class VerificationTokenDto extends createZodDto(VerificationTokenSchema) {
}
