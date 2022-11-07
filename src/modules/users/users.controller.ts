import { Body, Controller, Delete, Param, Patch, Post, Put } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserModel } from './models/user.model';
import { UsersService } from './users.service';

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

  @Delete(':id')
  public async delete(@Param() param: IdParam): Promise<void> {
    return this.users.delete(param.id);
  }

  // TODO add upload picture endpoint
}
