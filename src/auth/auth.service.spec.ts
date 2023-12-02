import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigDto } from '@/config/env.config';
import { PrismaService } from 'nestjs-prisma';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

jest.mock('@epic-web/totp');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
