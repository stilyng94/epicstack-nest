import { DocsSchema } from '@/prisma/generated/zod';
import { createPaginatedResponseSchema } from '@/shared/shared.dto';
import { createZodDto } from 'nestjs-zod';

export class PaginatedDocsResponseDto extends createZodDto(
  createPaginatedResponseSchema(DocsSchema),
) {}
