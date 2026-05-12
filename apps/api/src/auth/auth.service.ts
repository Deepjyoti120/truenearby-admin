import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthEntryDto } from './dto/entry.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // private signToken(user: { id: string; email: string }) {
  //   return this.jwtService.sign({
  //     sub: user.id,
  //     email: user.email,
  //   });
  // }

  private signAccessToken(user: { id: string; email: string }) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  private signRefreshToken(userId: string) {
    return this.jwtService.sign(
      {
        sub: userId,
      },
      {
        expiresIn: '30d',
      },
    );
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (!tokens.length) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    const isValid = await Promise.any(
      tokens.map((t) => bcrypt.compare(refreshToken, t.tokenHash)),
    ).catch(() => false);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email,
    });
    return { accessToken };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = this.signRefreshToken(user.id);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async entry(dto: AuthEntryDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });
    // REGISTER
    if (!user) {
      if (!dto.password) {
        throw new BadRequestException(
          'Password required for first-time registration',
        );
      }
      const passwordHash = await bcrypt.hash(dto.password, 12);
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          role: Role.user,
          passwordHash,
        },
        include: { profile: true },
      });
    } else {
      if (dto.password) {
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
      }
    }
    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = this.signRefreshToken(user.id);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    await this.upsertDeviceToken(user.id, dto.fcmToken, dto.platform);
    return {
      accessToken,
      user,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.tokenHash)) {
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: { isRevoked: true },
        });
        break;
      }
    }
  }
  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  private async upsertDeviceToken(
    userId: string,
    fcmToken?: string,
    platform?: string,
  ) {
    const normalizedToken = fcmToken?.trim();

    if (!normalizedToken) {
      return;
    }

    await this.prisma.userDevice.upsert({
      where: { fcmToken: normalizedToken },
      update: {
        userId,
        isActive: true,
        platform: platform?.trim() || 'unknown',
      },
      create: {
        userId,
        fcmToken: normalizedToken,
        platform: platform?.trim() || 'unknown',
        isActive: true,
      },
    });
  }
}
