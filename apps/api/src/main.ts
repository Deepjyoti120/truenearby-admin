import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createServer = async () => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.setGlobalPrefix('api/v1');
  await app.init();

  return server;
};
