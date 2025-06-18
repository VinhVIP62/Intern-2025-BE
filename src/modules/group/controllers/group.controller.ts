import { Controller } from '@nestjs/common';
import { GroupService } from '../providers/group.service';

@Controller('group')
export class GroupController {
	constructor(private readonly groupService: GroupService) {}
}
