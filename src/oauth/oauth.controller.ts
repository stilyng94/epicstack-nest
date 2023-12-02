import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { AuthenticateWithOauthDto } from './oauth.dto';
import { LoginCallbackResponseDto, LoginResponseDto } from '@/auth/auth.dto';
import { ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { JwtAuthGuard } from '@/auth/jwt.auth.guard';
import { CurrentUser } from '@/user/currentuser.decorator';
import { UserWithRoleDto } from '@/user/user.dto';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}
  @ZodSerializerDto(LoginCallbackResponseDto)
  @ApiOkResponse({ type: LoginCallbackResponseDto })
  @ApiBody({ type: AuthenticateWithOauthDto })
  @Post('google')
  async authenticateWithGoogle(@Body() dto: AuthenticateWithOauthDto) {
    return this.oauthService.authenticateWithGoogle(dto);
  }
  @ZodSerializerDto(LoginResponseDto)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: AuthenticateWithOauthDto })
  @UseGuards(JwtAuthGuard)
  @Post('google')
  async linkWithGoogle(
    @CurrentUser() user: UserWithRoleDto,
    @Body() dto: AuthenticateWithOauthDto,
  ) {
    return this.oauthService.linkWithGoogle({ dto, user });
  }
}
