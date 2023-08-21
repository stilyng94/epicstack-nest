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
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ScheduleModule } from '@nestjs/schedule';
import { AccessControlModule } from 'nest-access-control';
import { RBAC_POLICY } from './auth/rbac-policy';
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
      useFactory: (config: EnvConfigDto) => ({
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
          dir: process.cwd() + '/templates/mail-templates/',
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    AccessControlModule.forRoles(RBAC_POLICY, {}),
    AuthModule,
    UserModule,
    TwoFactorAuthModule,
    OauthModule,

    ScheduleModule.forRoot(),
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
