import { Module } from '@nestjs/common';
import { DebtorsService } from './debtors.service';
import { DebtorsController } from './debtors.controller';
import { PrismaService } from '@src/shared/database/prisma.service';
import { UsersService } from '../users/users.service';
import { FirebaseStorageProvider } from '@src/shared/providers/storage/firebase-storage.provider';
import { BCryptHashProvider } from '@src/shared/providers/hash/bcrypt-hash.provider';

@Module({
  providers: [DebtorsService, PrismaService, UsersService, FirebaseStorageProvider, BCryptHashProvider],
  controllers: [DebtorsController],
})
export class DebtorsModule {}
