import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EnvConfigDto } from '../config/env.config';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { ApiUserDto } from '../user/user.dto';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly envConfigDto: EnvConfigDto,
  ) {}

  public async generateTwoFactorAuthenticationSecret(user: ApiUserDto) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      'epic-stack-nest',
      secret,
    );

    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpAuthUrl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: ApiUserDto,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthSecret ?? '',
    });
  }
}
