import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

<<<<<<< HEAD
  app.enableCors();

  app.setGlobalPrefix('api/v1');
  if (!process.env.VERCEL) {
    await app.listen(3001);
    console.log('Nest API running at http://localhost:3001/api/v1');
  } else {
    await app.init();
  }
=======
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(3001);
  console.log('Nest API running at http://localhost:3001');
>>>>>>> 1316c88 (perfect)
}

bootstrap();
