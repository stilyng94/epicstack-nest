import { BadRequestException, Injectable } from '@nestjs/common';
import { google, Auth } from 'googleapis';
import { AuthenticateWithOauthDto, CreateWithOauthDto } from './oauth.dto';
import { EnvConfigDto } from '@/config/env.config';
import { AuthService } from '@/auth/auth.service';
import { UserService } from '@/user/user.service';
import { UserDto } from '@generated/zod';

@Injectable()
export class OauthService {
  private oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly envConfigDto: EnvConfigDto,
  ) {
    const clientID = this.envConfigDto.GOOGLE_AUTH_CLIENT_ID;
    const clientSecret = this.envConfigDto.GOOGLE_AUTH_CLIENT_SECRET;
    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async authenticateWithGoogle(dto: AuthenticateWithOauthDto) {
    const tokenInfo = await this.oauthClient.getTokenInfo(dto.token);

    const email = tokenInfo.email;

    if (!email) {
      throw new BadRequestException();
    }
    return this.authenticate(email, tokenInfo.sub!, dto);
  }

  private async authenticate(
    email: string,
    subject: string,
    dto: AuthenticateWithOauthDto,
  ) {
    const user = await this.userService.getByEmailOrUsername(email);

    if (user) {
      return this.handleRegisteredUser(user);
    }
    await this.registerUser({
      ...dto,
      email,
      subject,
    });
  }

  private async handleRegisteredUser(user: UserDto) {
    const { accessToken, refreshToken } = await this.getAuthTokens(user);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async registerUser(dto: CreateWithOauthDto) {
    const userData = await this.getUserData(dto.token);
    const user = await this.userService.createWithOauth({
      ...dto,
      username: userData.name,
    });
    return this.handleRegisteredUser(user);
  }

  private async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;
    this.oauthClient.setCredentials({
      access_token: token,
    });
    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });
    return userInfoResponse.data;
  }

  private async getAuthTokens(user: UserDto) {
    const accessToken = this.authService.setAccessToken({ id: user.id });
    const refreshToken = this.authService.setRefreshToken({ id: user.id });

    return {
      accessToken,
      refreshToken,
    };
  }
}
