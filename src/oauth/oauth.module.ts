import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  providers: [OauthService],
  controllers: [OauthController],
  imports: [UserModule, AuthModule],
})
export class OauthModule {}
