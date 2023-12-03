import {
  Inject,
  Injectable,
  NotImplementedException,
  OnModuleInit,
} from '@nestjs/common';
import Typesense, { Client } from 'typesense';
import type { TypesenseModuleOptions } from './typesense.module.options';
import { TYPESENSE_MODULE_OPTIONS_TOKEN } from './typesense.module-definition';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private _client: Client | undefined;

  constructor(
    @Inject(TYPESENSE_MODULE_OPTIONS_TOKEN)
    private options: TypesenseModuleOptions,
  ) {}

  onModuleInit() {
    this._client = new Typesense.Client(this.options);
  }

  public get client(): Client {
    if (!this._client) {
      throw new NotImplementedException('Typesense client not initialized');
    }
    return this._client;
  }
}
