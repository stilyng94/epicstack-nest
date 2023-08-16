import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"
import { CompleteUser, RelatedUserSchema, CompletePermission, RelatedPermissionSchema } from "./index"

export const RoleSchema = z.object({
  id: z.string().cuid2(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export class RoleDto extends createZodDto(RoleSchema) {
}

export interface CompleteRole extends z.infer<typeof RoleSchema> {
  users: CompleteUser[]
  permissions: CompletePermission[]
}

/**
 * RelatedRoleSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoleSchema: z.ZodSchema<CompleteRole> = z.lazy(() => RoleSchema.extend({
  users: RelatedUserSchema.array(),
  permissions: RelatedPermissionSchema.array(),
}))
