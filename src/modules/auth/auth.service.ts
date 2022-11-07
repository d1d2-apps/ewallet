import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/database/prisma.service';
import { BCryptHashProvider } from '@src/shared/providers/hash/bcrypt-hash.provider';
import { UserModel } from '../users/models/user.model';
import { authConfig } from '@src/config/auth.config';
import { plainToClass } from 'class-transformer';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { sign } from 'jsonwebtoken';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { addMinutes, isAfter } from 'date-fns';
import { SendInBlueMailProvider } from '@src/shared/providers/mail/send-in-blue-mail.provider';
import { IEmailData } from '@src/shared/providers/mail/mail.provider';
import { parseForgotPasswordEmailTemplate } from './mjml-templates/forgot-password.template';
import { ResetPasswordDto } from './dtos/reset-password.dto';

export interface IAuthResponse {
  user: UserModel;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private hashProvider: BCryptHashProvider,
    private mailProvider: SendInBlueMailProvider,
  ) {}

  public async authenticate(credentials: AuthenticateDto): Promise<IAuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: credentials.email } });

    if (!user) {
      throw new BadRequestException('Incorrect email/paswword combination');
    }

    const passwordMatched = await this.hashProvider.compareHash(credentials.password, user.password);

    if (!passwordMatched) {
      throw new BadRequestException('Incorrect email/paswword combination');
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, { subject: user.id, expiresIn });

    return { user: plainToClass(UserModel, user), token };
  }

  public async register(data: CreateUserDto): Promise<IAuthResponse> {
    const user = await this.userService.create(data);

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, { subject: user.id, expiresIn });

    return { user: plainToClass(UserModel, user), token };
  }

  public async sendForgotPasswordEmail({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(email);

    const lastToken = await this.prisma.resetPasswordToken.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

    let isLastTokenExpired = false;

    if (!lastToken || !lastToken.active || lastToken.expiresIn < new Date()) {
      isLastTokenExpired = true;
    }

    const resetPasswordToken = isLastTokenExpired
      ? await this.prisma.resetPasswordToken.create({
          data: {
            userId: user.id,
            active: true,
            expiresIn: addMinutes(new Date(), Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN)).toISOString(),
          },
        })
      : lastToken;

    const htmlContent = parseForgotPasswordEmailTemplate(user, resetPasswordToken);

    const emailData: IEmailData = {
      subject: 'eWallet: Recuperação de senha de acesso',
      from: {
        name: 'eWallet',
        email: 'recover@ewallet.com',
      },
      to: { email },
      htmlContent,
    };

    await this.mailProvider.sendEmail(emailData);
  }

  public async resetPassword(data: ResetPasswordDto): Promise<void> {
    if (data.password !== data.passwordConfirmation) {
      throw new BadRequestException('Password and password confirmation do not match');
    }

    const resetPasswordToken = await this.prisma.resetPasswordToken.findUnique({ where: { id: data.token } });

    if (!resetPasswordToken) {
      throw new BadRequestException('Invalid reset password token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: resetPasswordToken.userId } });

    if (!user) {
      throw new BadRequestException('Invalid reset password token');
    }

    if (isAfter(Date.now(), resetPasswordToken.expiresIn) || !resetPasswordToken.active) {
      throw new BadRequestException('Reset password token is expired');
    }

    const hashedPassword = await this.hashProvider.generateHash(data.password);

    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    await this.prisma.resetPasswordToken.update({ where: { id: resetPasswordToken.id }, data: { active: false } });
  }
}
