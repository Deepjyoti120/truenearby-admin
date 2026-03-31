import * as bcrypt from 'bcrypt';
import { getBoundingBox } from '../common/geo/geo.utils';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { SwipeDto } from './dto/swipe.dto';

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
