import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [TwoFactorAuthService],
  controllers: [TwoFactorAuthController],
  exports: [TwoFactorAuthService],
  imports: [UserModule, AuthModule],
})
export class TwoFactorAuthModule {}
