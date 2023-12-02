import { EnvConfigDto, EnvConfigSchema } from '@/config/env.config';
import { PrismaConfigService } from '@/config/prisma.config.service';
import { Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      isGlobal: true,
      load: dotenvLoader(),
      schema: EnvConfigDto,
      validate: (config) => EnvConfigSchema.parse(config),
    }),
    LoggerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [EnvConfigDto],
      useFactory: (envConfigDto: EnvConfigDto) => ({
        pinoHttp: {
          customProps: () => ({
            context: 'HTTP',
          }),
          transport:
            envConfigDto.ENV === 'production'
              ? {
                  target: 'pino-sentry-transport',
                  sentry: {
                    dsn: envConfigDto.SENTRY_DSN,
                  },
                  options: { singleLine: true },
                }
              : undefined,
        },
      }),
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useClass: PrismaConfigService,
    }),
  ],
})
export class SeedModule {}
