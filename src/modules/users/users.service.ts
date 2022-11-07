import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/shared/database/prisma.service';
import { BCryptHashProvider } from 'src/shared/providers/hash/bcrypt-hash.provider';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserModel } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private hashProvider: BCryptHashProvider) {}

  public async findAll(): Promise<UserModel[]> {
    const users = await this.prisma.user.findMany();

    return plainToInstance(UserModel, users);
  }

  public async findById(id: string): Promise<UserModel> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User not found with id [${id}]`);
    }

    return plainToClass(UserModel, user);
  }

  public async findByEmail(email: string): Promise<UserModel> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User not found with email [${email}]`);
    }

    return plainToClass(UserModel, user);
  }

  public async create(data: CreateUserDto): Promise<UserModel> {
    const userWithEmail = await this.prisma.user.findUnique({ where: { email: data.email } });

    if (userWithEmail) {
      throw new BadRequestException(`The provided email [${data.email}] is already in use`);
    }

    if (data.password !== data.passwordConfirmation) {
      throw new BadRequestException('Password and password confirmation do not match');
    }

    const hashedPassword = await this.hashProvider.generateHash(data.password);

    const createdUser = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return plainToClass(UserModel, createdUser);
  }

  public async update(id: string, data: UpdateUserDto): Promise<UserModel> {
    const user = await this.findById(id);

    if (data.email) {
      const userWithEmail = await this.prisma.user.findUnique({ where: { email: data.email } });

      if (userWithEmail) {
        throw new BadRequestException(`The provided email [${data.email}] is already in use`);
      }
    }

    data.name = data.name ?? user.name;
    data.email = data.email ?? user.email;

    const updatedUser = await this.prisma.user.update({ where: { id }, data });

    return plainToClass(UserModel, updatedUser);
  }

  public async changePassword(id: string, data: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);

    const oldPasswordMatch = await this.hashProvider.compareHash(data.oldPassword, user.password);

    if (!oldPasswordMatch) {
      throw new BadRequestException('Old password does not match');
    }

    if (data.password !== data.passwordConfirmation) {
      throw new BadRequestException('Password and password confirmation do not match');
    }

    const hashedPassword = await this.hashProvider.generateHash(data.password);

    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  }

  public async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    await this.prisma.user.delete({ where: { id: user.id } });
  }
}