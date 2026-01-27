import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { PhotosModule } from './photos/photos.module';
import { GeoModule } from './common/geo/geo.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProfileModule,
    PhotosModule,
    GeoModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
