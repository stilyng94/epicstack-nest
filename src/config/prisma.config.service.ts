import { Injectable } from '@nestjs/common';
import {
  PrismaOptionsFactory,
  PrismaServiceOptions,
  loggingMiddleware,
} from 'nestjs-prisma';

@Injectable()
export class PrismaConfigService implements PrismaOptionsFactory {
  createPrismaOptions(): PrismaServiceOptions | Promise<PrismaServiceOptions> {
    return {
      middlewares: [loggingMiddleware()],
      prismaOptions: {
        errorFormat: 'pretty',
        log: [
          {
            emit: 'stdout',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
      },
    };
  }
}
