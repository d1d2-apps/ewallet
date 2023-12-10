import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnsureOwnUserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const actionUserId = req.user.id;
    const reqUserId = req.params.id;

    if (actionUserId !== reqUserId) {
      throw new UnauthorizedException('Only own user can execute this action');
    }

    return next();
  }
}
