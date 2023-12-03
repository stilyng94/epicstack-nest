import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigDto } from '@/config/env.config';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

describe('TwoFactorAuthController', () => {
  let controller: TwoFactorAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorAuthController],
      providers: [
        TwoFactorAuthService,
        PrismaService,
        JwtService,
        UserService,
        AuthService,
        EnvConfigDto,
        {
          provide: MAILER_OPTIONS,
          useValue: { transport: new SMTPTransport({}) },
        },
        MailerService,
      ],
    }).compile();

    controller = module.get<TwoFactorAuthController>(TwoFactorAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
