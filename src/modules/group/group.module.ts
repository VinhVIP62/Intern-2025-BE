import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './providers/group.service';
import { Group, GroupSchema } from './entities/group.schema';
import { IGroupRepository } from './repositories/group.repository';
import { GroupRepositoryImpl } from './repositories/group.repository.impl';
import { Post, PostSchema } from '@modules/post/entities/post.schema';
import { NotificationModule } from '@modules/notification/notification.module';
import { PostModule } from '@modules/post/post.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Group.name, schema: GroupSchema },
			{ name: Post.name, schema: PostSchema },
		]),
		NotificationModule,
		PostModule,
	],
	controllers: [GroupController],
	providers: [GroupService, { provide: IGroupRepository, useClass: GroupRepositoryImpl }],
	exports: [GroupService],
})
export class GroupModule {}
