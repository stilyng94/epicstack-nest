import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { auth, oauth2 } from '@googleapis/oauth2';
import { AuthenticateWithOauthDto, CreateWithOauthDto } from './oauth.dto';
import { EnvConfigDto } from '@/config/env.config';
import { AuthService } from '@/auth/auth.service';
import { UserService } from '@/user/user.service';
import { UserWithRoleDto } from '@/user/user.dto';
import { AccountDto } from '@/prisma/generated/zod';

@Injectable()
export class OauthService {
  private oauthClient: InstanceType<typeof auth.OAuth2>;
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly envConfigDto: EnvConfigDto,
  ) {
    const clientID = this.envConfigDto.GOOGLE_AUTH_CLIENT_ID;
    const clientSecret = this.envConfigDto.GOOGLE_AUTH_CLIENT_SECRET;
    this.oauthClient = new auth.OAuth2(clientID, clientSecret, '');
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
    const existingOAuthUser = await this.userService.getOauthAccount({
      provider: dto.provider,
      subject,
    });

    if (!existingOAuthUser) {
      //The Oauth account has not logged in to this app before.  Create a
      // new user record and link it to the Oauth account
      return this.registerUser({
        ...dto,
        email,
        subject,
      });
    }
    // The Oauth account has previously logged in to the app.  Get the
    // user record linked to the Oauth account and log the user in
    return this.getAuthTokens(existingOAuthUser.user);
  }

  private async registerUser(dto: CreateWithOauthDto) {
    const userData = await this.getUserData(dto.token);
    const user = await this.userService.createUserWithOauth({
      ...dto,
      username: userData.name,
    });
    return this.getAuthTokens(user);
  }

  private async getUserData(token: string) {
    const userInfoClient = oauth2('v2').userinfo;
    this.oauthClient.setCredentials({
      access_token: token,
    });
    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });
    return userInfoResponse.data;
  }

  private async getAuthTokens(user: UserWithRoleDto) {
    const accessToken = this.authService.setAccessToken({ id: user.id });
    const refreshToken = await this.authService.setRefreshToken({
      id: user.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async linkWithGoogle({
    dto,
    user,
  }: {
    dto: AuthenticateWithOauthDto;
    user: UserWithRoleDto;
  }) {
    const tokenInfo = await this.oauthClient.getTokenInfo(dto.token);

    const email = tokenInfo.email;

    if (!email) {
      throw new BadRequestException();
    }
    return this.LinkAndAuthenticate({
      provider: dto.provider,
      subject: tokenInfo.sub!,
      userId: user.id,
    });
  }

  private async LinkAndAuthenticate({
    provider,
    subject,
    userId,
  }: {
    provider: Pick<AccountDto, 'provider'>['provider'];
    subject: string;
    userId: string;
  }) {
    const existingOAuthUser = await this.userService.getOauthAccount({
      provider,
      subject,
    });

    if (existingOAuthUser) {
      throw new ConflictException('Account already linked');
    }
    return this.userService.linkOauthAccount({
      provider: provider,
      subject: subject,
      userId,
    });
  }
}
