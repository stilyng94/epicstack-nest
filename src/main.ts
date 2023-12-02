import {
  HttpStatus,
  Logger as NestLogger,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { EnvConfigDto } from './config/env.config';
import helmet from 'helmet';
import { NextFunction, Request, Response } from 'express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { GlobalExceptionFilter } from './global-exception/global-exception.filter';
import hpp from 'hpp';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const logger = new NestLogger('Bootstrap');

  const envConfigDto = app.get(EnvConfigDto);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  app.useLogger(app.get(Logger));

  app.set('trust proxy', '1');
  app.disable('x-powered-by');
  app.use(hpp());
  app.enableCors({ optionsSuccessStatus: HttpStatus.NO_CONTENT });
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  if (envConfigDto.ENV === 'production') {
    // ensure HTTPS only (X-Forwarded-Proto comes from Host)
    app.use((req: Request, res: Response, next: NextFunction) => {
      const proto = req.get('X-Forwarded-Proto');
      const host = req.get('X-Forwarded-Host') ?? req.get('host');
      if (proto === 'http') {
        res.set('X-Forwarded-Proto', 'https');
        res.redirect(`https://${host}${req.originalUrl}`);
        return;
      }
      next();
    });

    app.use(
      helmet({
        referrerPolicy: { policy: 'same-origin' },
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          },
        },
      }),
    );
  }

  if (envConfigDto.ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EpicStack-Nest')
      .setDescription('EpicStack-Nest API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    patchNestJsSwagger();
    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_: string, methodKey: string) => methodKey,
    });
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(envConfigDto.PORT);

  logger.log(`app running on url =>> ${await app.getUrl()}`);
}
bootstrap();
