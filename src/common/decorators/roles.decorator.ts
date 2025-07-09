import { SetMetadata } from '@nestjs/common';
import { Role } from '@common/enum';
import { ROLES_KEY } from '@common/constants';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
