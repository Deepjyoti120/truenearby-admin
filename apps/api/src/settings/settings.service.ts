import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getSupportedCurrencies } from './currencies';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SettingsService {
  private ensurePromise: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    await this.ensureSingleton();
    const settings = await this.prisma.appSettings.findUnique({
      where: { id: SINGLETON_ID },
    });

    return {
      appName: settings?.appName ?? 'Dating Admin',
      currency: settings?.currency ?? 'USD',
      supportedCurrencies: getSupportedCurrencies(),
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    if (dto.currency === undefined && dto.appName === undefined) {
      throw new BadRequestException(
        'At least one of `currency` or `appName` must be provided',
      );
    }

    await this.ensureSingleton();
    const updated = await this.prisma.appSettings.update({
      where: { id: SINGLETON_ID },
      data: {
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.appName !== undefined ? { appName: dto.appName } : {}),
      },
    });

    return {
      appName: updated.appName,
      currency: updated.currency,
      supportedCurrencies: getSupportedCurrencies(),
    };
  }

  private async ensureSingleton() {
    if (!this.ensurePromise) {
      this.ensurePromise = this.prisma.appSettings
        .upsert({
          where: { id: SINGLETON_ID },
          create: { id: SINGLETON_ID, currency: 'USD', appName: 'Dating Admin' },
          update: {},
        })
        .then(() => undefined)
        .catch((error) => {
          this.ensurePromise = null;
          throw error;
        });
    }
    await this.ensurePromise;
  }
}
