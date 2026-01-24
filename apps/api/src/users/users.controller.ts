import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getUsers() {
    // return this.prisma.user.create({
    //   data: {
    //     email: 'deep@gmail.com',
    //     phone: '8811890839',
    //     passwordHash: 'hashed_password_here',
    //   },
    // });
    return this.prisma.user.findMany({ where: { isActive: true } });
  }
}
