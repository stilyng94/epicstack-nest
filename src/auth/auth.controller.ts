import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import {
  LoginCallbackResponseDto,
  LoginDto,
  LoginResponseDto,
} from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateUserDto } from '@/user/user.dto';
import { OtpRequestDTO } from '@/two-factor-auth/two-factor-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: LoginResponseDto })
  async register(@Body() userData: CreateUserDto) {
    await this.authService.register(userData);
    return {
      message: 'An email has been sent to your account',
    } satisfies LoginResponseDto;
  }

  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: OtpRequestDTO })
  @Post('register/callback')
  async verify(@Body() dto: OtpRequestDTO) {
    await this.authService.completeOnBoarding(dto);
    return {
      message: 'Account verification successful',
    } satisfies LoginResponseDto;
  }

  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    await this.authService.loginUser(dto.email);
    return {
      message: 'Check your email to finish logging in',
    } satisfies LoginResponseDto;
  }

  @ApiOkResponse({ type: LoginCallbackResponseDto })
  @ApiBody({ type: OtpRequestDTO })
  @Post('login/callback')
  async loginCallback(@Body() dto: OtpRequestDTO) {
    return this.authService.completeLogin(
      dto,
    ) satisfies Promise<LoginCallbackResponseDto>;
  }
}
