import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/shared/database/prisma.service';
import { BCryptHashProvider } from 'src/shared/providers/hash/bcrypt-hash.provider';

@Module({
  providers: [UsersService, PrismaService, BCryptHashProvider],
  controllers: [UsersController],
})
export class UsersModule {}
