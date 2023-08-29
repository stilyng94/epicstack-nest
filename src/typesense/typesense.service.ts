import { EnvConfigDto } from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import Typesense, { Client } from 'typesense';

@Injectable()
export class TypesenseService {
  private _client: Client;

  constructor(private readonly envConfigDto: EnvConfigDto) {
    this._client = new Typesense.Client({
      nodes: [
        {
          host: envConfigDto.TYPESENSE_HOST,
          port: envConfigDto.TYPESENSE_PORT,
          protocol: envConfigDto.TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: envConfigDto.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 5,
    });
  }

  public get client(): Client {
    return this._client;
  }
}
