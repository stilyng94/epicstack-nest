import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.stratergy';
import { JwtStrategy } from './jwt.stratergy';
import { UserModule } from '../user/user.module';
import { RefreshJwtStrategy } from './refresh.jwt.stratergy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  imports: [UserModule],
  exports: [AuthService],
})
export class AuthModule {}
