import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './providers/group.service';
import { Group, GroupSchema } from './entities/group.schema';
import { IGroupRepository } from './repositories/group.repository';
import { GroupRepositoryImpl } from './repositories/group.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }])],
	controllers: [GroupController],
	providers: [GroupService, { provide: IGroupRepository, useClass: GroupRepositoryImpl }],
	exports: [GroupService],
})
export class GroupModule {}
