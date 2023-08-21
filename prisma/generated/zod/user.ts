import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"
import { CompleteRole, RelatedRoleSchema, CompleteRefreshToken, RelatedRefreshTokenSchema, CompleteAccount, RelatedAccountSchema } from "./index"

export const UserSchema = z.object({
  id: z.string().cuid2(),
  email: z.string().toLowerCase().email(),
  username: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isTwoFactorAuthEnabled: z.boolean(),
  isVerified: z.boolean(),
})

export class UserDto extends createZodDto(UserSchema) {
}

export interface CompleteUser extends z.infer<typeof UserSchema> {
  roles: CompleteRole[]
  RefreshToken: CompleteRefreshToken[]
  Account: CompleteAccount[]
}

/**
 * RelatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => UserSchema.extend({
  roles: RelatedRoleSchema.array(),
  RefreshToken: RelatedRefreshTokenSchema.array(),
  Account: RelatedAccountSchema.array(),
}))
