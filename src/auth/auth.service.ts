import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from './auth.helpers';
import { ApiUserDto, CreateUserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { TokenPayloadDto } from './auth.dto';
import { EnvConfigDto } from '../config/env.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly envConfigDto: EnvConfigDto,
  ) {}

  async register(userData: CreateUserDto) {
    const password = await hashPassword(userData.password);
    const createdUser = await this.userService.create({
      ...userData,
      password,
    });
    return createdUser;
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: username }, { username }] },
    });
    const isPasswordValid = await verifyPassword(
      password,
      user?.password ?? '',
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Wrong credentials provided');
    }
    return user;
  }

  async login(user: ApiUserDto, is2faAuth = false) {
    const payload: TokenPayloadDto = { id: user.id, is2faAuth };

    return this.jwtService.sign(payload, {
      secret: this.envConfigDto.JWT_SECRET,
    });
  }

  async setRefreshToken(user: ApiUserDto, is2faAuth = false) {
    const payload: TokenPayloadDto = { id: user.id, is2faAuth };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.envConfigDto.REFRESH_TOKEN_SECRET,
    });
    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken },
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
    return tokenUser as unknown as ApiUserDto;
  }

  async logout(user: ApiUserDto) {
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  }
}
