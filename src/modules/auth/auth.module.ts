import { Module } from '@nestjs/common';

import { PrismaService } from '@src/shared/database/prisma.service';
import { hashServiceProvider } from '@src/shared/providers/hash';
import { mailServiceProvider } from '@src/shared/providers/mail';
import { storageServiceProvider } from '@src/shared/providers/storage';

import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService, hashServiceProvider, mailServiceProvider, storageServiceProvider],
})
export class AuthModule {}
