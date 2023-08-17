import { Injectable } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { UserDto } from '@generated/zod';

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly userService: UserService) {}

  public async generateTwoFactorAuthenticationSecret(user: UserDto) {
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

  public async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: UserDto,
  ) {
    const { twoFactorAuthSecret } = await this.userService.getUserById(user.id);
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twoFactorAuthSecret ?? '',
    });
  }
}
