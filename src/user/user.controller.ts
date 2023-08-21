import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import { CurrentUser } from './currentuser.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { TwoFactorAuthGuard } from '@/two-factor-auth/two-factor-auth.guard';
import { UserDto } from '@generated/zod';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';

@Controller('user')
export class UserController {
  @Get('profile')
  @ApiOkResponse({ type: UserDto })
  @ZodSerializerDto(UserDto)
  @UseGuards(JwtAuthGuard, ACGuard)
  @UseRoles({ resource: 'profile', action: 'read', possession: 'any' })
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: UserDto, @UserRoles() userRoles: any) {
    console.log('userRoles ', userRoles);

    return user;
  }

  @Get('profiler')
  @ApiOkResponse({ type: UserDto })
  @ZodSerializerDto(UserDto)
  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
  @ApiBearerAuth()
  getProfiler(@CurrentUser() user: UserDto) {
    return user;
  }
}
