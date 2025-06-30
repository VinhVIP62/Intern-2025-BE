import { SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '@common/constants';
import { Role } from '@common/enums';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
