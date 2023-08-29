import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const RoleSchema = z.object({
  id: z.string().cuid2(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export class RoleDto extends createZodDto(RoleSchema) {
}
