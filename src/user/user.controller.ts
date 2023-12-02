import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import { CurrentUser } from './currentuser.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { TwoFactorAuthGuard } from '@/two-factor-auth/two-factor-auth.guard';
import { UseRoles } from 'nest-access-control';
import { PaginatedUserResponseDto, UserWithRoleDto } from './user.dto';
import { AcRoleGuardGuard } from '@/auth/ac-role-guard.guard';
import { UserService } from './user.service';
import { PaginationParamsDto } from '@/shared/shared.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOkResponse({ type: UserWithRoleDto })
  @ZodSerializerDto(UserWithRoleDto)
  @UseGuards(JwtAuthGuard, AcRoleGuardGuard)
  @UseRoles({ resource: 'user', action: 'read', possession: 'own' })
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: UserWithRoleDto) {
    return user;
  }

  @Get(':id')
  @ApiOkResponse({ type: UserWithRoleDto })
  @ZodSerializerDto(UserWithRoleDto)
  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard, AcRoleGuardGuard)
  @UseRoles({ resource: 'user', action: 'read', possession: 'any' })
  @ApiBearerAuth()
  getProfiler(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get()
  @ZodSerializerDto(PaginatedUserResponseDto)
  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard, AcRoleGuardGuard)
  @UseRoles({ resource: 'user', action: 'read', possession: 'any' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginatedUserResponseDto })
  async getUsers(@Query() query: PaginationParamsDto) {
    return this.userService.getUsers(query);
  }
}
