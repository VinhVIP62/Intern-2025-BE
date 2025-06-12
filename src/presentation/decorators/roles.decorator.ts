import { SetMetadata } from '@nestjs/common';
import { Role } from '@application/services/user.service';
import { ROLES_KEY } from '@src/presentation/constants/roles.constants';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
