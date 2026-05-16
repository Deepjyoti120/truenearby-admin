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
import { ChatModule } from './chat/chat.module';
import { MatchesModule } from './matches/matches.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ReportModule } from './report/report.module';
import { SettingsModule } from './settings/settings.module';

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
    ChatModule,
    MatchesModule,
    PostsModule,
    LikesModule,
    SubscriptionsModule,
    FirebaseModule,
    ReportModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
