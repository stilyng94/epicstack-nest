import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const AccountSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  provider: z.union([z.literal('google'), z.literal('twitter')]),
  subject: z.string(),
  userId: z.string().cuid2(),
})

export class AccountDto extends createZodDto(AccountSchema) {
}
