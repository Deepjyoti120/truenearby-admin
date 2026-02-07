import * as bcrypt from 'bcrypt';
import { getBoundingBox } from '../common/geo/geo.utils';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
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
    console.log('Searching for user with email:', email);
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
  async swipe(fromUserId: string, dto: SwipeDto) {
    const swipe = await this.prisma.swipe.upsert({
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
    if (dto.type === 'LIKE') {
      const reverseLike = await this.prisma.swipe.findFirst({
        where: {
          fromUserId: dto.toUserId,
          toUserId: fromUserId,
          type: 'LIKE',
        },
      });
      // if (reverseLike) {
      //   await this.createMatch(fromUserId, dto.toUserId);
      // }
    }
    return swipe;
  }
}
