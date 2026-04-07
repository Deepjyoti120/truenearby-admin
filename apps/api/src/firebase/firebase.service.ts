import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import {
  Messaging,
  MulticastMessage,
  Notification,
  getMessaging,
} from 'firebase-admin/messaging';

type SendMulticastParams = {
  tokens: string[];
  notification?: Notification;
  data?: Record<string, string>;
};

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app?: App;
  private readonly messaging?: Messaging;

  constructor(private readonly configService: ConfigService) {
    const existingApp = getApps()[0];
    if (existingApp) {
      this.app = getApp();
      this.messaging = getMessaging(this.app);
      return;
    }

    const serviceAccountPath = this.resolveServiceAccountPath();
    if (!serviceAccountPath || !existsSync(serviceAccountPath)) {
      this.logger.warn(
        'Firebase service account file was not found. FCM delivery is disabled.',
      );
      return;
    }

    try {
      const rawCredentials = readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(rawCredentials) as Record<
        string,
        string
      >;
      this.app = initializeApp({
        credential: cert(serviceAccount),
      });
      this.messaging = getMessaging(this.app);
    } catch (error) {
      this.logger.error('Firebase Admin initialization failed.', error);
    }
  }

  async sendMulticast(params: SendMulticastParams) {
    if (!this.messaging) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [] as string[],
      };
    }

    const tokens = params.tokens
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    if (tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [] as string[],
      };
    }

    const message: MulticastMessage = {
      tokens,
      notification: params.notification,
      data: params.data,
    };

    const response = await this.messaging.sendEachForMulticast(message);
    const invalidTokens = response.responses.flatMap((result, index) => {
      if (!result.error) {
        return [];
      }

      const errorCode = result.error.code;
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered'
      ) {
        return [tokens[index]];
      }

      this.logger.warn(
        `FCM send failed for token ${tokens[index]}: ${errorCode}`,
      );
      return [];
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    };
  }

  private resolveServiceAccountPath() {
    const configuredPath = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );
    const fallbackPath = './config/firebase/service-account.json';
    const candidatePath = (configuredPath?.trim() || fallbackPath).trim();

    if (isAbsolute(candidatePath)) {
      return candidatePath;
    }

    return resolve(process.cwd(), candidatePath);
  }
}
