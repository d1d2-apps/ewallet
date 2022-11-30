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

  const whitelist = ['http://localhost:5173', 'http://192.168.1.114:5173'];

  app.enableCors({
    credentials: true,
    optionsSuccessStatus: 204,
    origin: whitelist,
    methods: 'GET, POST, PUT, PATCH, DELETE, UPDATE, OPTIONS',
  });

  await app.listen(process.env.PORT || 3333);
}
bootstrap();
