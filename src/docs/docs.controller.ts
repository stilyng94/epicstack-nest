import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Post,
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
import { DocsDto } from '@generated/zod';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AcRoleGuardGuard } from '@/auth/ac-role-guard.guard';
import { UseRoles } from 'nest-access-control';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SearchParamsDTo } from '@/shared/shared.dto';

@Controller('docs')
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  @Get('index')
  async indexDocs() {
    const indexedDocs = await this.docsService.indexDocs();
    return indexedDocs;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AcRoleGuardGuard)
  @UseRoles({
    resource: 'streamFile',
    action: 'read',
    possession: 'own',
  })
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
  async getDocsFromSearch(@Body() searchDto: SearchParamsDTo) {
    const docs = await this.docsService.getDocsFromSearch(searchDto);
    console.log('docs ', docs);

    return docs;
  }

  @Post()
  @UseGuards(JwtAuthGuard, AcRoleGuardGuard)
  @UseRoles({
    resource: 'uploadDoc',
    action: 'create',
    possession: 'own',
  })
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
    const fileMetadata = await this.docsService.addDoc({
      userId: user.id,
      file,
    });
    return { fileMetadata };
  }

  @Get()
  async getDocs() {
    const cachedDocs = await this.cacheService.get<Array<DocsDto> | null>(
      'getDocs',
    );
    if (cachedDocs) {
      console.log('from cache');

      return cachedDocs;
    }
    const docs: Array<DocsDto> = await this.docsService.getDocs();
    await this.cacheService.set('getDocs', docs);
    return docs;
  }
}
