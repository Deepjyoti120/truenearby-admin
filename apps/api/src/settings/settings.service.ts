import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from './dto/update-currency.dto';

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
      currency: (settings?.currency ?? 'USD') as SupportedCurrency,
      supportedCurrencies: [...SUPPORTED_CURRENCIES],
    };
  }

  async updateCurrency(currency: SupportedCurrency) {
    await this.ensureSingleton();
    const updated = await this.prisma.appSettings.update({
      where: { id: SINGLETON_ID },
      data: { currency },
    });

    return {
      currency: updated.currency as SupportedCurrency,
      supportedCurrencies: [...SUPPORTED_CURRENCIES],
    };
  }

  private async ensureSingleton() {
    if (!this.ensurePromise) {
      this.ensurePromise = this.prisma.appSettings
        .upsert({
          where: { id: SINGLETON_ID },
          create: { id: SINGLETON_ID, currency: 'USD' },
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
