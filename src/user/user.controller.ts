import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { CurrentUser } from './currentuser.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ApiUserDto } from './user.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { TwoFactorAuthGuard } from '../auth/two-factor-auth.guard';

@Controller('user')
export class UserController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(ApiUserDto)
  @ApiOkResponse({ type: ApiUserDto })
  @Get('profile')
  getProfile(@CurrentUser() user: ApiUserDto) {
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
  @ZodSerializerDto(ApiUserDto)
  @ApiOkResponse({ type: ApiUserDto })
  @Get('profiler')
  getProfiler(@CurrentUser() user: ApiUserDto) {
    return user;
  }
}
