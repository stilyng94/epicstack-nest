import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateUserDto,
  PaginatedUserResponseDto,
  UserWithRoleDto,
} from './user.dto';
import { CreateWithOauthDto } from '@/oauth/oauth.dto';
import { PaginationParamsDto } from '@/shared/shared.dto';
import { AccountDto } from '@generated/zod';
import { AppRoles } from '@/auth/app.roles';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string): Promise<UserWithRoleDto | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
      include: { role: { select: { name: true } } },
    });
  }

  async createUser(userData: CreateUserDto) {
    const newUser = await this.prisma.user.create({ data: userData });
    return newUser;
  }

  async getUserById(id: string): Promise<UserWithRoleDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: { select: { name: true } } },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async turnOnTwoFactorAuth(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorAuthEnabled: true },
    });
  }

  async createUserWithOauth(dto: CreateWithOauthDto): Promise<UserWithRoleDto> {
    const user = await this.prisma.account.create({
      data: {
        provider: dto.provider,
        subject: dto.subject,
        user: {
          create: {
            email: dto.email,
            username: dto.username,
            role: {
              connect: { name: 'USER' satisfies (typeof AppRoles)['USER'] },
            },
          },
        },
      },
      select: { user: { include: { role: { select: { name: true } } } } },
    });

    if (!user) {
      throw new BadRequestException();
    }
    return user.user;
  }

  async getUsers(dto: PaginationParamsDto): Promise<PaginatedUserResponseDto> {
    const [count, items] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        take: dto.limit,
        skip: dto.offset,
        cursor: dto.cursor ? { id: dto.cursor } : undefined,
        include: { role: { select: { name: true } } },
      }),
    ]);

    return {
      count,
      items: items satisfies Array<UserWithRoleDto>,
      cursor: items.at(-1)?.id ?? dto.cursor ?? '',
    };
  }

  async getOauthAccount({
    provider,
    subject,
  }: {
    provider: Pick<AccountDto, 'provider'>['provider'];
    subject: string;
  }) {
    return this.prisma.account.findUnique({
      where: { provider_subject: { provider, subject } },
      include: { user: { include: { role: { select: { name: true } } } } },
    });
  }

  async linkOauthAccount({
    provider,
    subject,
    userId,
  }: {
    provider: Pick<AccountDto, 'provider'>['provider'];
    subject: string;
    userId: string;
  }): Promise<UserWithRoleDto> {
    const user = await this.prisma.account.create({
      data: {
        provider: provider,
        subject,
        userId,
      },
      select: { user: { include: { role: { select: { name: true } } } } },
    });

    if (!user) {
      throw new BadRequestException();
    }
    return user.user;
  }
}
