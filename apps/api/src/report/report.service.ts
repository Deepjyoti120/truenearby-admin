import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          userId: reporterId,
          reportedUserId: dto.reportedUserId,
          description: dto.description,
        },
      });
      return report;
    });
    return {
      success: true,
      result,
    };
  }
}
