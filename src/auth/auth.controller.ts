import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateUserDto } from '@/user/user.dto';
import { UserDto } from '@generated/zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(LoginResponseDto)
  @ApiCreatedResponse({ type: LoginResponseDto })
  async register(@Body() userData: CreateUserDto) {
    await this.authService.register(userData);
    //Send magic link
    return {
      message: 'An email has been sent to your account',
    };
  }

  @ZodSerializerDto(LoginResponseDto)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.validateUser(dto.email);
  }
}
