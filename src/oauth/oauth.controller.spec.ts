import { Test, TestingModule } from '@nestjs/testing';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { EnvConfigDto } from '@/config/env.config';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

describe('OauthController', () => {
  let controller: OauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OauthController],
      providers: [
        OauthService,
        UserService,
        AuthService,
        EnvConfigDto,
        PrismaService,
        JwtService,
        MailerService,
        {
          provide: MAILER_OPTIONS,
          useValue: { transport: new SMTPTransport({}) },
        },
      ],
    }).compile();

    controller = module.get<OauthController>(OauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
