import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';

describe('TwoFactorAuthService', () => {
  let service: TwoFactorAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwoFactorAuthService],
      imports: [UserModule, AuthModule],
    }).compile();

    service = module.get<TwoFactorAuthService>(TwoFactorAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
