import * as bcrypt from 'bcrypt';
import { getBoundingBox } from '../common/geo/geo.utils';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Gender, LookingFor, Prisma, Role } from '../generated/prisma/client';
import { SwipeDto } from './dto/swipe.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { ListUsersDto } from './dto/list-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  private users = [
    {
      id: 1,
      email: 'admin@test.com',
      password: bcrypt.hashSync('admin123', 10),
    },
  ];

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  async listUsers(dto: ListUsersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = dto.search?.trim();

    const where: Prisma.UserWhereInput = {
      role: Role.user,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(dto.gender ? { profile: { is: { gender: dto.gender } } } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          profile: { select: { name: true, gender: true } },
        },
      }),
    ]);

    return {
      data: items.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        name: u.profile?.name ?? null,
        gender: u.profile?.gender ?? null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async setUserActive(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.user) {
      throw new BadRequestException(
        'Only users with role "user" can be toggled',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    return updated;
  }

  private buildAdminProfileDefaults(profileName: string) {
    return {
      name: profileName,
      gender: Gender.OTHER,
      lookingFor: LookingFor.OPEN_TO_ANYTHING,
      birthDate: new Date('2000-01-01'),
      latitude: 0,
      longitude: 0,
      isHidden: true,
      isRegistered: false,
      isVerified: false,
      interests: [],
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profileName: user.profile?.name ?? '',
    };
  }

  async updateCurrentUser(userId: string, dto: UpdateCurrentUserDto) {
    const trimmedProfileName = dto.profileName?.trim();
    const shouldUpdateName = dto.profileName !== undefined;
    const wantsPasswordChange = !!dto.currentPassword || !!dto.newPassword;

    if (!shouldUpdateName && !wantsPasswordChange) {
      throw new BadRequestException('No changes provided');
    }

    if (!!dto.currentPassword !== !!dto.newPassword) {
      throw new BadRequestException(
        'Current password and new password are both required',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (wantsPasswordChange) {
      const isValidPassword = await bcrypt.compare(
        dto.currentPassword!,
        user.passwordHash,
      );

      if (!isValidPassword) {
        throw new BadRequestException('Current password is incorrect');
      }

      const isSamePassword = await bcrypt.compare(
        dto.newPassword!,
        user.passwordHash,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from the current password',
        );
      }
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      if (shouldUpdateName) {
        if (user.profile) {
          await tx.profile.update({
            where: { userId },
            data: {
              name: trimmedProfileName || null,
            },
          });
        } else if (trimmedProfileName) {
          await tx.profile.create({
            data: {
              userId,
              ...this.buildAdminProfileDefaults(trimmedProfileName),
            },
          });
        }
      }

      if (wantsPasswordChange) {
        await tx.user.update({
          where: { id: userId },
          data: {
            passwordHash: await bcrypt.hash(dto.newPassword!, 12),
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        profileName: updatedUser.profile?.name ?? '',
      },
    };
  }

  async getNearbyUsersHybrid(
    userId: string,
    lat: number,
    lng: number,
    radiusKm = 20,
    limit = 20,
    page = 1,
  ) {
    const offset = (page - 1) * limit;
    const { minLat, maxLat, minLng, maxLng } = getBoundingBox(
      lat,
      lng,
      radiusKm,
    );
    const users = await this.prisma.$queryRaw(
      Prisma.sql`
      SELECT * FROM (
        SELECT 
          u.id,
          p.gender,
          p.bio,
          p.latitude,
          p.longitude,
          p.city,
          p.country,
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )
          ) AS distance
        FROM users u
        JOIN profiles p ON p."userId" = u.id
        WHERE
          u.id != ${userId}
          AND u."isActive" = true
          AND p."isHidden" = false
          AND NOT EXISTS (
            SELECT 1 FROM swipes s
            WHERE s."fromUserId" = ${userId}
            AND s."toUserId" = u.id
          )
          AND NOT EXISTS (
            SELECT 1 FROM blocks b
            WHERE b."blockerId" = ${userId}
            AND b."blockedId" = u.id
          )
          AND p.latitude BETWEEN ${minLat} AND ${maxLat}
          AND p.longitude BETWEEN ${minLng} AND ${maxLng}
      ) AS sub
      WHERE sub.distance <= ${radiusKm}
      ORDER BY sub.distance ASC
      LIMIT ${limit}
      OFFSET ${offset};
    `,
    );
    return users;
  }
  // async swipe(fromUserId: string, dto: SwipeDto) {
  //   const swipe = await this.prisma.swipe.upsert({
  //     where: {
  //       fromUserId_toUserId: {
  //         fromUserId,
  //         toUserId: dto.toUserId,
  //       },
  //     },
  //     update: { type: dto.type },
  //     create: {
  //       fromUserId,
  //       toUserId: dto.toUserId,
  //       type: dto.type,
  //     },
  //   });
  //   if (dto.type === 'LIKE') {
  //     const reverseLike = await this.prisma.swipe.findFirst({
  //       where: {
  //         fromUserId: dto.toUserId,
  //         toUserId: fromUserId,
  //         type: 'LIKE',
  //       },
  //     });
  //     if (reverseLike) {
  //       await this.createMatch(fromUserId, dto.toUserId);
  //     }
  //   }
  //   return swipe;
  // }
  // private async createMatch(user1Id: string, user2Id: string) {
  //   const [userAId, userBId] =
  //     user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
  //   return this.prisma.$transaction(async (tx) => {
  //     const existing = await tx.match.findUnique({
  //       where: {
  //         userAId_userBId: {
  //           userAId,
  //           userBId,
  //         },
  //       },
  //     });
  //     if (existing) {
  //       return existing;
  //     }
  //     const match = await tx.match.create({
  //       data: {
  //         userAId,
  //         userBId,
  //       },
  //     });
  //     await tx.chat.create({
  //       data: {
  //         matchId: match.id,
  //       },
  //     });
  //     return match;
  //   });
  // }
  async swipe(fromUserId: string, dto: SwipeDto) {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot swipe yourself');
    }
    return this.prisma.$transaction(async (tx) => {
      const swipe = await tx.swipe.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId,
            toUserId: dto.toUserId,
          },
        },
        update: { type: dto.type },
        create: {
          fromUserId,
          toUserId: dto.toUserId,
          type: dto.type,
        },
      });
      if (dto.type !== 'LIKE') {
        return { swipe, match: null };
      }
      const reverseLike = await tx.swipe.findFirst({
        where: {
          fromUserId: dto.toUserId,
          toUserId: fromUserId,
          type: 'LIKE',
        },
        select: { id: true },
      });
      if (!reverseLike) {
        return { swipe, match: null };
      }
      const [userAId, userBId] =
        fromUserId < dto.toUserId
          ? [fromUserId, dto.toUserId]
          : [dto.toUserId, fromUserId];
      const match = await tx.match.upsert({
        where: {
          userAId_userBId: {
            userAId,
            userBId,
          },
        },
        update: {},
        create: {
          userAId,
          userBId,
          chat: {
            create: {},
          },
        },
        include: {
          chat: true,
        },
      });
      return { swipe, match };
    });
  }
}
