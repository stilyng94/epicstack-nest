import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local.auth.guard';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { ApiUserDto, CreateUserDto } from '../user/user.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse()
  async register(@Body() userData: CreateUserDto) {
    await this.authService.register(userData);
  }

  @UseGuards(LocalAuthGuard)
  @ZodSerializerDto(LoginResponseDto)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Req() req: Request) {
    const accessToken = await this.authService.login(
      req.user as unknown as ApiUserDto,
    );
    const refreshToken = await this.authService.setRefreshToken(
      req.user as unknown as User,
    );

    return { accessToken, refreshToken };
  }
}
