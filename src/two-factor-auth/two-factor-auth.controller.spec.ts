import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthService } from './two-factor-auth.service';

describe('TwoFactorAuthController', () => {
  let controller: TwoFactorAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorAuthController],
      providers: [TwoFactorAuthService],
    }).compile();

    controller = module.get<TwoFactorAuthController>(TwoFactorAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
