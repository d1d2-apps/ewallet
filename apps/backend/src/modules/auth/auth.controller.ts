import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto } from '../users/dtos/create-user.dto';
import { AuthService, IAuthResponse } from './auth.service';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  public async authenticate(@Body() authenticateDto: AuthenticateDto): Promise<IAuthResponse> {
    return this.authService.authenticate(authenticateDto);
  }

  @Post('sign-up')
  public async register(@Body() createUserDto: CreateUserDto): Promise<IAuthResponse> {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  public async sendForgotPasswordEmail(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return this.authService.sendForgotPasswordEmail(forgotPasswordDto);
  }

  @Post('reset-password')
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
