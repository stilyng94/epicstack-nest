import { Body, Controller, Post } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { AuthenticateWithOauthDto } from './oauth.dto';
import { LoginResponseDto } from '@/auth/auth.dto';
import { ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @ZodSerializerDto(LoginResponseDto)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: AuthenticateWithOauthDto })
  @Post('google')
  async authenticateWithGoogle(@Body() dto: AuthenticateWithOauthDto) {
    return this.oauthService.authenticateWithGoogle(dto);
  }
}
