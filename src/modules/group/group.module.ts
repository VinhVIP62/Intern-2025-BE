import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './providers/group.service';
import { Group, GroupSchema } from './entities/group.schema';
import { IGroupRepository } from './interfaces/group.repository';
import { GroupRepositoryImpl } from './repositories/group.repository.impl';
import { Post, PostSchema } from '@modules/post/entities/post.schema';
import { NotificationModule } from '@modules/notification/notification.module';
import { PostModule } from '@modules/post/post.module';
import { UserModule } from '@modules/user/user.module';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { EventModule } from '@modules/event/event.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Group.name, schema: GroupSchema },
			{ name: Post.name, schema: PostSchema },
			{ name: User.name, schema: UserSchema },
		]),
		NotificationModule,
		PostModule,
		UserModule,
		forwardRef(() => EventModule),
	],
	controllers: [GroupController],
	providers: [GroupService, { provide: IGroupRepository, useClass: GroupRepositoryImpl }],
	exports: [GroupService],
})
export class GroupModule {}
