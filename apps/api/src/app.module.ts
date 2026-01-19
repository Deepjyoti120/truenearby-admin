import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule], // 👈 THIS IS REQUIRED
})
export class AppModule {}
