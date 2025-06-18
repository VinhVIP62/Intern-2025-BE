import { Module } from '@nestjs/common';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './providers/group.service';

@Module({
	controllers: [GroupController],
	providers: [GroupService],
})
export class GroupModule {}
