import { Module } from '@nestjs/common';
import { dotenvLoader, TypedConfigModule } from 'nest-typed-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigSchema, EnvConfigDto } from './config/env.config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import {
  PrismaModule,
  providePrismaClientExceptionFilter,
} from 'nestjs-prisma';
import { PrismaConfigService } from './config/prisma.config.service';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth/two-factor-auth.controller';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { LoggerErrorInterceptor, LoggerModule } from 'nestjs-pino';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      isGlobal: true,
      load: dotenvLoader(),
      schema: EnvConfigDto,
      validate: (config) => EnvConfigSchema.parse(config),
    }),
    LoggerModule.forRootAsync({
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
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        global: true,
        verifyOptions: { algorithms: ['HS256'] },
        signOptions: { expiresIn: '3600s' },
      }),
    }),
    AuthModule,
    UserModule,
    TwoFactorAuthModule,
    OauthModule,
  ],
  controllers: [AppController, TwoFactorAuthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggerErrorInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    providePrismaClientExceptionFilter(),
    AppService,
    TwoFactorAuthService,
  ],
})
export class AppModule {}
