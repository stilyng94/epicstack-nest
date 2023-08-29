import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const UserSchema = z.object({
  id: z.string().cuid2(),
  email: z.string().toLowerCase().email(),
  username: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isTwoFactorAuthEnabled: z.boolean(),
  isVerified: z.boolean(),
  roleId: z.string(),
})

export class UserDto extends createZodDto(UserSchema) {
}
