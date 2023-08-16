import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayloadDto } from './auth.dto';
import { UserService } from '../user/user.service';
import { EnvConfigDto } from '../config/env.config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly envConfigDto: EnvConfigDto,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envConfigDto.JWT_SECRET,
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayloadDto) {
    req['is2faAuth'] = payload.is2faAuth;
    return this.userService.getUserById(payload.id);
  }
}
