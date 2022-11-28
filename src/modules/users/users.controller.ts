import { Body, Controller, Delete, Get, Patch, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { UsersService } from './users.service';

import { ChangePasswordDto } from './dtos/change-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

import { UserModel } from './models/user.model';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  public async getMe(@Req() req: Request): Promise<UserModel> {
    return this.users.findById(req.user.id);
  }

  @Put('profile')
  public async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto): Promise<UserModel> {
    return this.users.update(req.user.id, updateUserDto);
  }

  @Patch('account/password')
  public async changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
    return this.users.changePassword(req.user.id, changePasswordDto);
  }

  @Patch('profile/picture')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadPicture(@Req() req: Request, @UploadedFile() file: Express.Multer.File): Promise<UserModel> {
    return this.users.uploadPicture(req.user.id, file);
  }

  @Delete('account')
  public async delete(@Req() req: Request): Promise<void> {
    return this.users.delete(req.user.id);
  }
}
