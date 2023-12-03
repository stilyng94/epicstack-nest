import { ConfigurableModuleBuilder } from '@nestjs/common';
import { TypesenseModuleOptions } from './typesense.module.options';

export const {
  ConfigurableModuleClass: TypesenseConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: TYPESENSE_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<TypesenseModuleOptions>().build();
