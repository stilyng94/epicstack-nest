import { PaginationParamsDto, SearchParamsDTo } from '@/shared/shared.dto';
import { TypesenseService } from '@/typesense/typesense.service';
import { DocsDto } from '@/prisma/generated/zod/docs';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { PaginatedDocsResponseDto } from './docs.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DocsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly typesenseService: TypesenseService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  async addDoc(arg: { userId: string; file: Express.Multer.File }) {
    const doc = await this.prismaService.docs.create({
      data: {
        filename: arg.file.filename,
        mimetype: arg.file.mimetype,
        path: arg.file.path,
        userId: arg.userId,
      },
    });
    if (!doc) {
      throw new BadRequestException();
    }

    return doc;
  }

  async getDocById({
    id,
    userId,
  }:
    | {
        id: string;
        userId?: string;
      }
    | {
        id: string;
        userId: string;
      }): Promise<DocsDto> {
    const file = await this.prismaService.docs.findUnique({
      where: { id, userId },
    });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async getDocs(dto: PaginationParamsDto): Promise<PaginatedDocsResponseDto> {
    const [count, items] = await this.prismaService.$transaction([
      this.prismaService.docs.count(),
      this.prismaService.docs.findMany({
        take: dto.limit,
        skip: dto.offset,
        cursor: dto.cursor ? { id: dto.cursor } : undefined,
      }),
    ]);

    await this.cacheService.set('getDocs', {
      count,
      items: items satisfies Array<DocsDto>,
      cursor: items.at(-1)?.id ?? dto.cursor ?? '',
    });

    return {
      count,
      items: items satisfies Array<DocsDto>,
      cursor: items.at(-1)?.id ?? dto.cursor ?? '',
    };
  }

  async getDocsFromSearch(searchDto: SearchParamsDTo): Promise<unknown> {
    return this.typesenseService.client
      .collections('docs')
      .documents()
      .search(searchDto);
  }

  async indexDocs() {
    const docs = await this.prismaService.docs.findMany();
    const collectionExists = await this.typesenseService.client
      .collections('docs')
      .exists();
    if (!collectionExists) {
      await this.typesenseService.client.collections().create({
        name: 'docs',
        fields: [
          {
            name: 'id',
            type: 'string',
            index: true,
          },
          {
            name: 'filename',
            type: 'string',
            index: true,
          },
          {
            name: 'mimeType',
            type: 'string',
            facet: true,
            index: false,
          },
          {
            name: 'createdAt',
            type: 'auto',
            index: false,
          },
          {
            name: 'userId',
            type: 'string',
            index: false,
          },
        ],
        default_sorting_field: 'createdAt',
      });
    }
    return this.typesenseService.client
      .collections('docs')
      .documents()
      .import(docs, { action: 'upsert' });
  }
}
