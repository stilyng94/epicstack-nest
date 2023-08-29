import { Module } from '@nestjs/common';
import { TypesenseService } from './typesense.service';

@Module({
  exports: [TypesenseService],
  providers: [TypesenseService],
})
export class TypesenseModule {}
