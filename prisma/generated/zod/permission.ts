import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"
import { CompleteRole, RelatedRoleSchema } from "./index"

export const PermissionSchema = z.object({
  id: z.string().cuid2(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export class PermissionDto extends createZodDto(PermissionSchema) {
}

export interface CompletePermission extends z.infer<typeof PermissionSchema> {
  roles: CompleteRole[]
}

/**
 * RelatedPermissionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPermissionSchema: z.ZodSchema<CompletePermission> = z.lazy(() => PermissionSchema.extend({
  roles: RelatedRoleSchema.array(),
}))
