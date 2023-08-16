import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { CurrentUser } from '../user/currentuser.decorator';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiUserDto } from '../user/user.dto';
import { AuthService } from '../auth/auth.service';
import { Activate2FARequestDTO } from './two-factor-auth.dto';

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
  async register2fa(
    @CurrentUser() user: ApiUserDto,
    @Res() response: Response,
  ) {
    const { otpAuthUrl } =
      await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
        user,
      );

    this.twoFactorAuthService.pipeQrCodeStream(response, otpAuthUrl);
    response.appendHeader('content-type', 'image/png');
  }

  @Post('activate')
  @ZodSerializerDto(ApiUserDto)
  @ApiOkResponse({ type: ApiUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async activateTwoFactorAuth(
    @CurrentUser() user: ApiUserDto,
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
    @CurrentUser() user: ApiUserDto,
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

    const accessToken = await this.authService.login(user, true);
    const refreshToken = await this.authService.setRefreshToken(user);

    return { accessToken, refreshToken };
  }
}
