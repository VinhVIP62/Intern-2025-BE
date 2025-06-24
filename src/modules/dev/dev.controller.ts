import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard } from '@common/guards';
import { Controller, Get, UseGuards } from '@nestjs/common';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller()
export class DevController {
	@Get()
	entry() {
		return 'Dev route';
	}
}
