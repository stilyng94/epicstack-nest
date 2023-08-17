import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { hashPassword } from './auth.helpers';
import { LoginResponseDto, TokenPayloadDto } from './auth.dto';
import { EnvConfigDto } from '@/config/env.config';
import { CreateUserDto } from '@/user/user.dto';
import { UserService } from '@/user/user.service';
import { UserDto } from '@generated/zod';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly envConfigDto: EnvConfigDto,
  ) {}

  async register(userData: CreateUserDto) {
    const createdUser = await this.userService.create({
      ...userData,
    });
    return createdUser;
  }

  async validateUser(email: string): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    //Send magic link mail
    return {
      message: 'If your account exists an email will be sent to it',
    };
  }

  async login(user: UserDto, is2faAuth = false) {
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
}
