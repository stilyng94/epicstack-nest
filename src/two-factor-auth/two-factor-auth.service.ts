import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { UserDto } from '@generated/zod';
import { generateTOTP, verifyTOTP, getTOTPAuthUri } from '@epic-web/totp';
import { PrismaService } from 'nestjs-prisma';
import { VerificationTypes } from '@/auth/auth.dto';

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly prisma: PrismaService) {}

  public async generateTwoFactorAuthenticationSecret(user: UserDto) {
    const { secret, period, digits, algorithm } = generateTOTP();
    const otpUri = getTOTPAuthUri({
      secret,
      period,
      digits,
      algorithm,
      issuer: 'epicstack-nest',
      accountName: user.email,
    });

    const qrCode = await QRCode.toDataURL(otpUri);

    await this.prisma.verificationToken.create({
      data: {
        type: '2fa',
        target: user.id,
        secret,
        period,
        digits,
        algorithm,
      },
    });

    return { qrCode, otpUri };
  }

  public async isTwoFactorAuthenticationCodeValid({
    user,
    code,
    type,
  }: {
    user: UserDto;
    code: string;
    type: VerificationTypes;
  }) {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { target_type: { target: user.id, type } },
      select: { algorithm: true, secret: true, period: true, digits: true },
    });
    if (!verification)
      throw new UnauthorizedException('Wrong authentication code');

    const isValid = verifyTOTP({
      otp: code,
      ...verification,
    });
    if (!isValid) throw new UnauthorizedException('Wrong authentication code');

    return verification;
  }

  public async updateTokenType({ userId }: { userId: string }) {
    await this.prisma.verificationToken.update({
      where: { target_type: { target: userId, type: '2fa' } },
      data: {
        type: '2fa-verify',
      },
    });
  }
}
