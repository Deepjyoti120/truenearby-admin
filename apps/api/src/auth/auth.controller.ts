import { Body, Controller, Post } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      message: 'Account created successfully',
      data: await this.authService.register(dto),
    };
  }
}
