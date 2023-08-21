import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { Generate2faResponseDto, OtpRequestDTO } from './two-factor-auth.dto';
import { AuthService } from '@/auth/auth.service';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import { CurrentUser } from '@/user/currentuser.decorator';
import { UserService } from '@/user/user.service';
import { UserDto } from '@generated/zod';
import { LoginCallbackResponseDto, LoginResponseDto } from '@/auth/auth.dto';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private twoFactorAuthService: TwoFactorAuthService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('generate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: Generate2faResponseDto })
  async register2fa(@CurrentUser() user: UserDto) {
    return this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
      user,
    ) satisfies Promise<Generate2faResponseDto>;
  }

  @Post('activate')
  @ZodSerializerDto(LoginResponseDto)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async activateTwoFactorAuth(
    @CurrentUser() user: UserDto,
    @Body() twoFactorAuthCode: OtpRequestDTO,
  ) {
    await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid({
      code: twoFactorAuthCode.code,
      user,
      type: '2fa',
    });

    await this.userService.turnOnTwoFactorAuth(user.id);
    await this.twoFactorAuthService.updateTokenType({ userId: user.id });
    return { message: '2fa successfully activated' } satisfies LoginResponseDto;
  }

  @Post('authenticate')
  @ApiOkResponse({ type: LoginCallbackResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @CurrentUser() user: UserDto,
    @Body() twoFactorAuthCode: OtpRequestDTO,
  ) {
    await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid({
      code: twoFactorAuthCode.code,
      user,
      type: '2fa-verify',
    });

    return this.authService.generateAuthTokens({
      user,
      is2faAuth: true,
    }) satisfies Promise<LoginCallbackResponseDto>;
  }
}
