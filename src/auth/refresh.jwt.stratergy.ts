import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayloadDto } from './auth.dto';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { EnvConfigDto } from '@/config/env.config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    private readonly envConfigDto: EnvConfigDto,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('X-REFRESH-TOKEN'),
      ignoreExpiration: false,
      secretOrKey: envConfigDto.REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayloadDto) {
    const token = request.header['X-REFRESH-TOKEN'];
    return this.authService.getUserByRefreshToken(token, payload.id);
  }
}
