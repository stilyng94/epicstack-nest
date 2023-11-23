import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { hashPassword } from './auth.helpers';
import { TokenPayloadDto, VerificationTypes } from './auth.dto';
import { EnvConfigDto } from '@/config/env.config';
import { CreateUserDto, UserWithRoleDto } from '@/user/user.dto';
import { UserService } from '@/user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { typeOTPConfig } from '@/utils/crypto-utils';
import { OtpRequestDTO } from '@/two-factor-auth/two-factor-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly envConfigDto: EnvConfigDto,
    private readonly emailService: MailerService,
  ) {}

  async register(userData: CreateUserDto) {
    const createdUser = await this.userService.createUser({
      ...userData,
    });
    if (!createdUser) {
      throw new ConflictException('Account already exists');
    }
    const { verifyUrl } = await this.prepareVerification({
      period: 10 * 60, // 10 minutes
      type: 'registration',
      target: userData.email,
      destinationUrl: 'https://localhost:5010/frontend/verify',
    });

    this.emailService.sendMail({
      to: userData.email,
      subject: 'Welcome',
      template: 'welcome.mail.ejs',
      context: { verifyUrl },
    });
  }

  async loginUser(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { role: { select: { name: true } } },
    });
    if (user) {
      const { verifyUrl } = await this.prepareVerification({
        period: 5 * 60, //5minutes
        type: 'login',
        target: user.email,
        destinationUrl: 'https://localhost:5010/frontend/verify',
      });

      this.emailService.sendMail({
        to: user.email,
        subject: 'Login',
        template: 'welcome.mail.ejs',
        context: { verifyUrl },
      });
    }
  }

  async generateAuthTokens({
    user,
    is2faAuth = false,
  }: {
    user: UserWithRoleDto;
    is2faAuth?: boolean;
  }) {
    const payload: TokenPayloadDto = { id: user.id, is2faAuth };
    const accessToken = this.setAccessToken(payload);
    const refreshToken = await this.setRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  setAccessToken(payload: TokenPayloadDto) {
    return this.jwtService.sign(payload, {
      secret: this.envConfigDto.JWT_SECRET,
    });
  }

  async setRefreshToken(payload: TokenPayloadDto) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.envConfigDto.REFRESH_TOKEN_SECRET,
    });
    await this.prisma.refreshToken.create({
      data: { userId: payload.id, token: refreshToken },
    });
    return hashPassword(refreshToken);
  }

  async getUserByRefreshToken(refreshToken: string, userId: string) {
    const tokenUser = await this.prisma.refreshToken.findFirst({
      where: { userId, token: refreshToken },
      select: { user: true },
    });
    if (!tokenUser) {
      throw new ForbiddenException('Expired token');
    }
    return tokenUser;
  }

  async logout(user: User) {
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  }

  getDestinationUrl({
    type,
    target,
    destinationUrl,
  }: {
    type: VerificationTypes;
    target: string;
    destinationUrl: string;
  }) {
    const verifyUrl = new URL(destinationUrl);
    verifyUrl.searchParams.set('type', type);
    verifyUrl.searchParams.set('target', target);
    return verifyUrl;
  }

  async prepareVerification({
    period,
    type,
    target,
    destinationUrl,
  }: {
    period: number;
    type: VerificationTypes;
    target: string;
    destinationUrl?: string;
  }) {
    const verifyUrl = destinationUrl
      ? this.getDestinationUrl({ type, target, destinationUrl })
      : null;

    const { generateTOTP } = await import('@epic-web/totp');

    const { otp, ...otpConfig } = generateTOTP({ algorithm: 'SHA256', period });
    // delete old verifications. Users should not have more than one verification
    // of a specific type for a specific target at a time.
    await this.prisma.verificationToken.deleteMany({ where: { type, target } });
    await this.prisma.verificationToken.create({
      data: {
        type,
        target,
        ...otpConfig,
        expiresAt: new Date(Date.now() + otpConfig.period * 1000),
      },
    });

    // add the otp to the url we'll email the user.
    verifyUrl?.searchParams.set('code', otp);

    return { otp, verifyUrl: verifyUrl?.toString() };
  }

  async completeOnRegistration({ code, type, target }: OtpRequestDTO) {
    await this.isCodeValid({ code, type, target });
    await this.deleteCode({ target, type });
    await this.prisma.user.update({
      where: { email: target },
      data: { isVerified: true },
    });
  }

  async isCodeValid({
    code,
    type,
    target,
  }: {
    code: string;
    type: VerificationTypes;
    target: string;
  }) {
    const verification = await this.prisma.verificationToken.findFirst({
      where: {
        OR: [
          { type, target, expiresAt: { gt: new Date() } },
          { type, target, expiresAt: null },
        ],
      },
      select: { algorithm: true, secret: true, period: true },
    });
    if (!verification) throw new BadRequestException();

    const { verifyTOTP } = await import('@epic-web/totp');

    const result = verifyTOTP({
      otp: code,
      secret: verification.secret,
      algorithm: verification.algorithm,
      period: verification.period,
      ...typeOTPConfig[type],
    });

    if (!result) throw new BadRequestException();
  }

  private async deleteCode({
    type,
    target,
  }: {
    type: VerificationTypes;
    target: string;
  }) {
    return this.prisma.verificationToken.delete({
      where: {
        target_type: {
          type,
          target,
        },
      },
    });
  }

  async completeLogin({
    code,
    type,
    target,
  }: {
    code: string;
    type: VerificationTypes;
    target: string;
  }) {
    await this.isCodeValid({ code, type, target });
    await this.deleteCode({ target, type });
    const user = await this.prisma.user.findUnique({
      where: { email: target },
      include: { role: { select: { name: true } } },
    });
    if (!user) {
      throw new BadRequestException();
    }

    return this.generateAuthTokens({ user });
  }
}
