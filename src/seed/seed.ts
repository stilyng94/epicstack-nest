import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { SeedModule } from './seed.module';
import { PrismaService } from 'nestjs-prisma';

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    bufferLogs: true,
  });
  const seedLogger = new Logger('Seed');

  app.useLogger(app.get(PinoLogger));
  const primaService = app.get(PrismaService);

  const users = await primaService.$transaction([
    primaService.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    }),
    primaService.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER' },
    }),
  ]);

  seedLogger.log('users ==> ', users);

  await app.close();
}

seed();
