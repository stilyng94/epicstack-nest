import * as z from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod/dto';
import {
  CompleteRole,
  RelatedRoleSchema,
  CompleteRefreshToken,
  RelatedRefreshTokenSchema,
  CompleteAccount,
  RelatedAccountSchema,
  CompleteDocs,
  RelatedDocsSchema,
} from './index';

export const UserSchema = z.object({
  id: z.string().cuid2(),
  email: z.string().toLowerCase().email(),
  username: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isTwoFactorAuthEnabled: z.boolean(),
  isVerified: z.boolean(),
  roleId: z.string(),
});

export class UserDto extends createZodDto(UserSchema) {}

export interface CompleteUser extends z.infer<typeof UserSchema> {
  role: CompleteRole;
  RefreshToken: CompleteRefreshToken[];
  Account: CompleteAccount[];
  Docs: CompleteDocs[];
}

/**
 * RelatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() =>
  UserSchema.extend({
    role: RelatedRoleSchema,
    RefreshToken: RelatedRefreshTokenSchema.array(),
    Account: RelatedAccountSchema.array(),
    Docs: RelatedDocsSchema.array(),
  }),
);
