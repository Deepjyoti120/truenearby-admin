import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors();

  app.setGlobalPrefix('api/v1');
  if (!process.env.VERCEL) {
    await app.listen(3001);
    console.log('Nest API running at http://localhost:3001/api/v1');
  } else {
    await app.init();
  }
}

bootstrap();

export const handler = serverless(expressApp);
