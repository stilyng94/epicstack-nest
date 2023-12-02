import { Test, TestingModule } from '@nestjs/testing';
import { OauthService } from './oauth.service';
import { UserService } from '@/user/user.service';
import { EnvConfigDto } from '@/config/env.config';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

describe('OauthService', () => {
  let oauthService: OauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OauthService,
        UserService,
        EnvConfigDto,
        AuthService,
        PrismaService,
        JwtService,
        MailerService,
        {
          provide: MAILER_OPTIONS,
          useValue: { transport: new SMTPTransport({}) },
        },
      ],
    }).compile();

    oauthService = module.get<OauthService>(OauthService);
  });

  it('should be defined', () => {
    expect(oauthService).toBeDefined();
  });
});
