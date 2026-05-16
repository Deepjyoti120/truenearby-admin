import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

/**
 * Mark a route handler as requiring one of the given roles.
 * Use together with `JwtAuthGuard` + `RolesGuard`.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
