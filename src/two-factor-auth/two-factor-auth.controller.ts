import {
  Body,
  Controller,
  Post,
  Res,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import { Activate2FARequestDTO } from './two-factor-auth.dto';
import { AuthService } from '@/auth/auth.service';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import { CurrentUser } from '@/user/currentuser.decorator';
import { UserService } from '@/user/user.service';
import { UserDto } from '@generated/zod';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private twoFactorAuthService: TwoFactorAuthService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('generate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  async register2fa(@CurrentUser() user: UserDto, @Res() response: Response) {
    const { otpAuthUrl } =
      await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
        user,
      );

    this.twoFactorAuthService.pipeQrCodeStream(response, otpAuthUrl);
    response.appendHeader('content-type', 'image/png');
  }

  @Post('activate')
  @ZodSerializerDto(UserDto)
  @ApiOkResponse({ type: UserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async activateTwoFactorAuth(
    @CurrentUser() user: UserDto,
    @Body() twoFactorAuthCode: Activate2FARequestDTO,
  ) {
    const isCodeValid =
      await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthCode.otp,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuth(user.id);
  }

  @Post('authenticate')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @CurrentUser() user: UserDto,
    @Body() twoFactorAuthCode: Activate2FARequestDTO,
  ) {
    const isCodeValid =
      await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthCode.otp,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessToken = this.authService.login(user, true);
    const refreshToken = await this.authService.setRefreshToken(user);

    return { accessToken, refreshToken };
  }
}
