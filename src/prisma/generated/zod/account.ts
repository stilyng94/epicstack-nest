import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import { CompleteUser, RelatedUserSchema } from './index';

export const AccountSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  provider: z.union([z.literal('google'), z.literal('twitter')]),
  subject: z.string(),
  userId: z.string().cuid2(),
});

export class AccountDto extends createZodDto(AccountSchema) {}

export interface CompleteAccount extends z.infer<typeof AccountSchema> {
  user: CompleteUser;
}

/**
 * RelatedAccountSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAccountSchema: z.ZodSchema<CompleteAccount> = z.lazy(() =>
  AccountSchema.extend({
    user: RelatedUserSchema,
  }),
);
