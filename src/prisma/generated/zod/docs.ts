import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { CompleteUser, RelatedUserSchema } from './index';

export const DocsSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  path: z.string(),
  filename: z.string(),
  mimetype: z.string(),
  userId: z.string(),
});

export class DocsDto extends createZodDto(DocsSchema) {}

export interface CompleteDocs extends z.infer<typeof DocsSchema> {
  user: CompleteUser;
}

/**
 * RelatedDocsSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedDocsSchema: z.ZodSchema<CompleteDocs> = z.lazy(() =>
  DocsSchema.extend({
    user: RelatedUserSchema,
  }),
);
