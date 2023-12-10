import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { authConfig } from '@src/config/auth.config';
import { verify } from 'jsonwebtoken';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

@Injectable()
export class EnsureAuthenticatedMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('JWT token is missing');
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = verify(token, authConfig.jwt.secret);

      const { sub } = decoded as ITokenPayload;

      req.user = { id: sub };

      return next();
    } catch (err) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}
