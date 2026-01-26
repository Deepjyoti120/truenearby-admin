import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthEntryDto } from './dto/entry.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      message: 'Account created successfully',
      data: await this.authService.register(dto),
    };
  }

  @Post('entry')
  async entry(
    @Body() dto: AuthEntryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.entry(dto);
    res.cookie('refresh_token', result._refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refresh_token as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token as string;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refresh_token', {
      path: '/auth/refresh',
    });

    return { success: true };
  }
}
