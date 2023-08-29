import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { SearchParams } from 'typesense/lib/Typesense/Documents';

export class PaginationParamsDto extends createZodDto(
  z.object({
    limit: z.coerce.number().int().positive().min(1).default(1),
    offset: z.coerce.number().int().min(0).default(0),
    cursor: z.coerce.string().cuid2().optional(),
  }),
) {}

export class PaginatedResponseDto<T> {
  count: number;
  items: Array<T>;
  cursor: string;

  constructor(count: number, items: Array<T>, cursor: string) {
    this.count = count;
    this.items = items;
    this.cursor = cursor;
  }
}

export function createPaginatedResponseSchema<ItemType extends z.ZodTypeAny>(
  itemSchema: ItemType,
) {
  return z.object({
    count: z.number().int().default(0),
    items: z.array(itemSchema),
    cursor: z.string().cuid2().optional(),
  });
}

const searchParamsSchema: z.ZodType<SearchParams> = z.object({
  q: z.string(),
  query_by: z.string(),
  filter_by: z.string().optional(),
  sort_by: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  per_page: z.coerce.number().positive().optional(),
});

export class SearchParamsDTo extends createZodDto(searchParamsSchema) {}
