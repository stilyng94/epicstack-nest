import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigDto } from '@/config/env.config';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '@/auth/auth.service';
import { UserService } from '@/user/user.service';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

describe('TwoFactorAuthService', () => {
  let twoFactorService: TwoFactorAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthService,
        JwtService,
        EnvConfigDto,
        PrismaService,
        AuthService,
        {
          provide: MAILER_OPTIONS,
          useValue: { transport: new SMTPTransport({}) },
        },
        MailerService,
        UserService,
      ],
    }).compile();

    twoFactorService = module.get<TwoFactorAuthService>(TwoFactorAuthService);
  });

  it('should be defined', () => {
    expect(twoFactorService).toBeDefined();
  });
});
