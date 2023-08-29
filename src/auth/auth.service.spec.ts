import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserModule } from '@/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtStrategy } from './jwt.stratergy';
import { RefreshJwtStrategy } from './refresh.jwt.stratergy';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
      imports: [UserModule, MailerModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
