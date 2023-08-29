import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { TypesenseModule } from '@/typesense/typesense.module';

@Module({
  controllers: [DocsController],
  providers: [DocsService],
  imports: [TypesenseModule],
})
export class DocsModule {}
