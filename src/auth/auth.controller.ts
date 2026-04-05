import { Request } from 'express';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthDto } from './dto/login-auth.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { Public } from './decorators/isPublic.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user?.sub;
    const refreshToken = req.user?.refreshToken;
    if (userId && refreshToken) {
      return this.authService.refreshTokens(Number(userId), refreshToken);
    } else {
      throw new Error('Missing refresh token or user ID.');
    }
  }

  @Get('logout')
  logout(@Req() req: Request) {
    if (req.user) {
      this.authService.logout(Number(req.user?.sub));
    }
  }
}
