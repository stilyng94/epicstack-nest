import { Module, ValidationPipe } from '@nestjs/common';
import { dotenvLoader, TypedConfigModule } from 'nest-typed-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigSchema, EnvConfigDto } from './config/env.config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'nestjs-prisma';
import { PrismaConfigService } from './config/prisma.config.service';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { LoggerModule } from 'nestjs-pino';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { AccessControlModule } from 'nest-access-control';
import { RBAC_POLICY } from './auth/app.roles';
import { HealthModule } from './health/health.module';
import { DocsModule } from './docs/docs.module';
import { OauthModule } from './oauth/oauth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuardGuard } from './shared/throttler-behind-proxy-guard.guard';
import { TypesenseModule } from './typesense/typesense.module';
import path from 'node:path';

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
    ThrottlerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [EnvConfigDto],
      useFactory: () => ({ ttl: 60, limit: 10 }),
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        global: true,
        verifyOptions: { algorithms: ['HS256'] },
        signOptions: { expiresIn: '3600s' },
      }),
    }),
    MailerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [EnvConfigDto],
      useFactory: (config: EnvConfigDto) => {
        return {
          transport: {
            pool: true,
            debug: config.ENV === 'development',
            host: config.MAIL_HOST,
            port: config.MAIL_PORT,
            secure: config.MAIL_SECURE,
            auth: {
              user: config.MAIL_AUTH_USER,
              pass: config.MAIL_AUTH_PASSWORD,
            },
          },
          defaults: {
            sender: {
              name: config.DEFAULT_FROM_NAME,
              address: config.DEFAULT_FROM_ADDRESS,
            },
          },
          preview: config.ENV === 'development',
          template: {
            dir: path.join(__dirname, '/templates/mail-templates/'),
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    CacheModule.register({ isGlobal: true, ttl: 30000 }),
    AccessControlModule.forRoles(RBAC_POLICY, {}),
    OauthModule,
    AuthModule,
    UserModule,
    TwoFactorAuthModule,
    HealthModule,
    DocsModule,
    TypesenseModule.registerAsync({
      useFactory: (envConfigDto: EnvConfigDto) => {
        return {
          nodes: [
            {
              host: envConfigDto.TYPESENSE_HOST,
              port: envConfigDto.TYPESENSE_PORT,
              protocol: envConfigDto.TYPESENSE_PROTOCOL,
            },
          ],
          apiKey: envConfigDto.TYPESENSE_API_KEY,
          connectionTimeoutSeconds: 5,
          logLevel: 'INFO',
        };
      },
      inject: [EnvConfigDto],
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_PIPE, useClass: ValidationPipe },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuardGuard,
    },
    AppService,
  ],
})
export class AppModule {}
