import { SearchParamsDTo } from '@/shared/shared.dto';
import { TypesenseService } from '@/typesense/typesense.service';
import { DocsDto } from '@generated/zod/docs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class DocsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly typesenseService: TypesenseService,
  ) {}

  async addDoc(arg: { userId: string; file: Express.Multer.File }) {
    const fileMetadata = await this.prismaService.docs.create({
      data: {
        filename: arg.file.filename,
        mimetype: arg.file.mimetype,
        path: arg.file.path,
        userId: arg.userId,
      },
    });
    if (!fileMetadata) {
      throw new BadRequestException();
    }

    return fileMetadata;
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

  async getDocs(): Promise<DocsDto[]> {
    return this.prismaService.docs.findMany();
  }

  async getDocsFromSearch(searchDto: SearchParamsDTo): Promise<unknown> {
    return this.typesenseService.client
      .collections('docs')
      .documents()
      .search(searchDto);
  }

  async indexDocs() {
    const docs = await this.prismaService.docs.findMany();
    return this.typesenseService.client
      .collections('docs')
      .documents()
      .import(docs, { action: 'upsert' });
  }
}
