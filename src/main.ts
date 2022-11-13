import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { initializeFirebaseApp } from './config/firebase.config';

initializeFirebaseApp();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const whitelist = ['http://localhost:3000'];

  app.enableCors({
    credentials: true,
    optionsSuccessStatus: 204,
    origin: whitelist,
    methods: 'GET, POST, PUT, DELETE, UPDATE, OPTIONS',
  });

  await app.listen(process.env.PORT || 3333);
}
bootstrap();
