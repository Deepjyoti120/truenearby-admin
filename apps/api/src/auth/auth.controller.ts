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
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private config: ConfigService,
  ) {}

  private get refreshCookieOptions() {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    } as const;
  }

  private get accessCookieOptions() {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    return {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    } as const;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      message: 'Account created successfully',
      data: await this.authService.register(dto),
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('refresh_token', result.refreshToken, this.refreshCookieOptions);
    res.cookie('accessToken', result.accessToken, this.accessCookieOptions);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('entry')
  async entry(
    @Body() dto: AuthEntryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.entry(dto);
    res.cookie('refresh_token', result.refreshToken, this.refreshCookieOptions);

    return {
      accessToken: result.accessToken,
      ...(dto.platform != 'web' ? { refreshToken: result.refreshToken } : {}),
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body: { refreshToken?: string }) {
    const refreshToken =
      body.refreshToken ?? (req.cookies?.refresh_token as string | undefined);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      body.refreshToken ?? (req.cookies?.refresh_token as string | undefined);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refresh_token', {
      path: '/api/v1/auth',
    });
    res.clearCookie('accessToken', { path: '/' });

    return { success: true };
  }
}
