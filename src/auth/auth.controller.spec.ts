import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EnvConfigDto } from '@/config/env.config';
import { UserService } from '@/user/user.service';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PrismaService } from 'nestjs-prisma';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        UserService,
        EnvConfigDto,
        PrismaService,
        {
          provide: MAILER_OPTIONS,
          useValue: { transport: new SMTPTransport({}) },
        },
        MailerService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
