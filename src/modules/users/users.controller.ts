import { Body, Controller, Delete, Param, Patch, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UsersService } from './users.service';

import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

import { UserModel } from './models/user.model';

class IdParam {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Post()
  public async create(@Body() createUserDto: CreateUserDto): Promise<UserModel> {
    return this.users.create(createUserDto);
  }

  @Put(':id')
  public async update(@Param() param: IdParam, @Body() updateUserDto: UpdateUserDto): Promise<UserModel> {
    return this.users.update(param.id, updateUserDto);
  }

  @Patch(':id/password')
  public async changePassword(@Param() param: IdParam, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
    return this.users.changePassword(param.id, changePasswordDto);
  }

  @Patch(':id/picture')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadPicture(@Param() param: IdParam, @UploadedFile() file: Express.Multer.File): Promise<UserModel> {
    return this.users.uploadPicture(param.id, file);
  }

  @Delete(':id')
  public async delete(@Param() param: IdParam): Promise<void> {
    return this.users.delete(param.id);
  }
}
