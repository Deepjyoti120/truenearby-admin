import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ReverseGeocodeAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
};

type ReverseGeocodeResponse = {
  address?: ReverseGeocodeAddress;
};

@Injectable()
export class ReverseGeocodeService {
  private readonly logger = new Logger(ReverseGeocodeService.name);
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('NOMINATIM_REVERSE_URL') ??
      'https://nominatim.openstreetmap.org/reverse';
    this.userAgent =
      this.configService.get<string>('NOMINATIM_USER_AGENT') ??
      'deepjyoti-next-admin/1.0';
    this.timeoutMs = Number(
      this.configService.get<string>('NOMINATIM_TIMEOUT_MS') ?? '4000',
    );
  }

  async getCityAndCountry(latitude: number, longitude: number) {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
      addressdetails: '1',
    });
    const url = `${this.baseUrl}?${params.toString()}`;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `Reverse geocode failed with status ${response.status} for ${latitude},${longitude}`,
        );
        return { city: null, country: null };
      }

      const payload = (await response.json()) as ReverseGeocodeResponse;
      const address = payload.address;

      const city =
        address?.city ??
        address?.town ??
        address?.village ??
        address?.municipality ??
        address?.hamlet ??
        address?.county ??
        address?.state_district ??
        address?.state ??
        null;
      const country = address?.country ?? null;

      return { city, country };
    } catch (error) {
      this.logger.warn(
        `Reverse geocode request failed for ${latitude},${longitude}: ${(error as Error).message}`,
      );
      return { city: null, country: null };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
