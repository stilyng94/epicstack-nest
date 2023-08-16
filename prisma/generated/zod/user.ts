import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"
import { CompleteRole, RelatedRoleSchema, CompleteRefreshToken, RelatedRefreshTokenSchema } from "./index"

export const UserSchema = z.object({
  id: z.string().cuid2(),
  email: z.string(),
  password: z.password(),
  username: z.string(),
  name: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  /**
   * Two factor authentication secret
   */
  twoFactorAuthSecret: z.string().nullish(),
  isTwoFactorAuthEnabled: z.boolean(),
})

export class UserDto extends createZodDto(UserSchema) {
}

export interface CompleteUser extends z.infer<typeof UserSchema> {
  roles: CompleteRole[]
  RefreshToken: CompleteRefreshToken[]
}

/**
 * RelatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => UserSchema.extend({
  roles: RelatedRoleSchema.array(),
  RefreshToken: RelatedRefreshTokenSchema.array(),
}))
