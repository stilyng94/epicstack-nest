import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.stratergy';
import { RefreshJwtStrategy } from './refresh.jwt.stratergy';
import { UserModule } from '@/user/user.module';

@Module({
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  imports: [UserModule],
  exports: [AuthService],
})
export class AuthModule {}
