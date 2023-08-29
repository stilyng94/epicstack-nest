import { Test, TestingModule } from '@nestjs/testing';
import { OauthService } from './oauth.service';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';

describe('OauthService', () => {
  let service: OauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OauthService],
      imports: [UserModule, AuthModule],
    }).compile();

    service = module.get<OauthService>(OauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
