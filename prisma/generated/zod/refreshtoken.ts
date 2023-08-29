import * as z from "nestjs-zod/z"
import { createZodDto } from "nestjs-zod/dto"

export const RefreshTokenSchema = z.object({
  id: z.string().cuid2(),
  token: z.string(),
  userId: z.string().cuid2(),
})

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {
}
