import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signIn(data: AuthDto): Promise<any> {
    const user = await this.usersService.findOneByEmail(data.email);
    if (!user) {
      throw new HttpException(
        `User with email: ${data.email} doesn't exists.`,
        HttpStatus.NOT_FOUND
      );
    }

    const passwordValid = await argon2.verify(user.password, data.password);

    if (!passwordValid) {
      throw new HttpException(
        `The password is incorrect.`,
        HttpStatus.PRECONDITION_FAILED
      );
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // TODO - do not send a full user object, rather only the information we need
    return { tokens, user };
  }

  async logout(userId: number) {
    return this.usersService.update(userId, { refreshToken: '' });
  }

  async hashData(data: string) {
    return await argon2.hash(data);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, email: string) {
    // TODO - discuss what data we need in tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '24h',
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshTokens(id: number, refreshToken: string) {
    const user = await this.usersService.findOne(id);
    if (!user || !user.refreshToken) {
      throw new HttpException(
        `There is no existing refresh token.`,
        HttpStatus.PRECONDITION_FAILED
      );
    }
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken
    );

    if (!refreshTokenMatches) {
      throw new HttpException(
        `Refresh token missmatch.`,
        HttpStatus.PRECONDITION_FAILED
      );
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
