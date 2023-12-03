import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EnvConfigDto } from '@/config/env.config';
import { PrismaService } from 'nestjs-prisma';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, EnvConfigDto, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
