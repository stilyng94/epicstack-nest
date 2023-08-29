import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const DocsSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  path: z.string(),
  filename: z.string(),
  mimetype: z.string(),
  userId: z.string(),
})

export class DocsDto extends createZodDto(DocsSchema) {
}
