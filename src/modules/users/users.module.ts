import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { PrismaService } from 'src/shared/database/prisma.service';
import { BCryptHashProvider } from 'src/shared/providers/hash/bcrypt-hash.provider';
import { FirebaseStorageProvider } from '@src/shared/providers/storage/firebase-storage.provider';

@Module({
  providers: [UsersService, PrismaService, BCryptHashProvider, FirebaseStorageProvider],
  controllers: [UsersController],
})
export class UsersModule {}
