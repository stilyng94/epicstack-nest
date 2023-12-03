import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocsService } from './docs.service';
import { CurrentUser } from '@/user/currentuser.decorator';
import { UserWithRoleDto } from '@/user/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import path from 'path';
import { createReadStream } from 'fs';
import { DocsDto } from '@/prisma/generated/zod';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AcRoleGuardGuard } from '@/auth/ac-role-guard.guard';
import { UseRoles } from 'nest-access-control';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PaginationParamsDto, SearchParamsDTo } from '@/shared/shared.dto';
import { PaginatedDocsResponseDto } from './docs.dto';
import { TwoFactorAuthGuard } from '@/two-factor-auth/two-factor-auth.guard';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('doc')
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  @Post('index')
  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard, AcRoleGuardGuard)
  @UseRoles({ resource: 'docs', action: 'create', possession: 'any' })
  async indexDocs() {
    const indexedDocs = await this.docsService.indexDocs();
    return indexedDocs;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async streamFile(
    @Param('id') id: string,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    const fileMetadata: DocsDto = await this.docsService.getDocById({
      userId: user.role.name === 'USER' ? user.id : undefined,
      id: id,
    });
    const stream = createReadStream(fileMetadata.path);

    return new StreamableFile(stream, {
      disposition: `inline; filename="${fileMetadata.filename}"`,
      type: fileMetadata.mimetype,
    });
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDocsFromSearch(@Body() searchDto: SearchParamsDTo) {
    const docs = await this.docsService.getDocsFromSearch(searchDto);
    return docs;
  }

  @Post()
  @ZodSerializerDto(DocsDto)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), './public/uploads'),
        filename: (_, file, cb) => {
          cb(
            null,

            `${new Date()
              .toISOString()
              .replace(/:/g, '-')}-${file.originalname.replace(/\s+/g, '')}`,
          );
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: DocsDto })
  async uploadDoc(
    @CurrentUser() user: UserWithRoleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'png|jpeg|pdf' })
        .addMaxSizeValidator({ maxSize: 100000 })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    const doc = await this.docsService.addDoc({
      userId: user.id,
      file,
    });
    return doc;
  }

  @Get()
  @ZodSerializerDto(PaginatedDocsResponseDto)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginatedDocsResponseDto })
  async getDocs(@Query() query: PaginationParamsDto) {
    const cachedDocs =
      await this.cacheService.get<PaginatedDocsResponseDto | null>('getDocs');
    if (cachedDocs) {
      console.log('from cache');
      return cachedDocs;
    }
    const docs = await this.docsService.getDocs(query);
    await this.cacheService.set('getDocs', docs);
    return docs;
  }
}
