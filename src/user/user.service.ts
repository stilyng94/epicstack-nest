import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getByEmailOrUsername(emailOrUsername: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.prisma.user.create({ data: userData });
    return newUser;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorAuthSecret: secret },
    });
  }

  async turnOnTwoFactorAuth(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorAuthEnabled: true },
    });
  }
}