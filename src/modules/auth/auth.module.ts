import { Module } from '@nestjs/common';
import { PrismaService } from '@src/shared/database/prisma.service';
import { BCryptHashProvider } from '@src/shared/providers/hash/bcrypt-hash.provider';
import { SendInBlueMailProvider } from '@src/shared/providers/mail/send-in-blue-mail.provider';
import { FirebaseStorageProvider } from '@src/shared/providers/storage/firebase-storage.provider';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService, BCryptHashProvider, SendInBlueMailProvider, FirebaseStorageProvider],
})
export class AuthModule {}
