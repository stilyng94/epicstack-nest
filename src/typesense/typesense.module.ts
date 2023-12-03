import { Global, Module } from '@nestjs/common';
import { TypesenseService } from './typesense.service';
import { TypesenseConfigurableModuleClass } from './typesense.module-definition';

@Global()
@Module({
  exports: [TypesenseService],
  providers: [TypesenseService],
})
export class TypesenseModule extends TypesenseConfigurableModuleClass {}
