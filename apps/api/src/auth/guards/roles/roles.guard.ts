import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { ROLES_KEY } from '../../decorators/roles.decorator';

/**
 * Enforces `@Roles(...)`. JWT payload doesn't include the role to avoid
 * stale tokens after a role change, so we re-read the role from the DB on
 * every protected request. Keep `@Roles()` only on infrequent admin endpoints.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id?: string } }>();
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !user.role || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
