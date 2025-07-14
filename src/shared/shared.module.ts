import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from '@modules/friend/entities/friend.schema';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { Profile, ProfileSchema } from '@modules/user/entities/profile.schema';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { ProfileRepositoryImpl } from '@modules/user/repositories/profile.repository.impl';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { UserRepositoryImpl } from '@modules/user/repositories/user.repository.impl';
import { IPostRepository } from '@modules/post/repositories/post.repository';
import { Post, PostSchema } from '@modules/post/entities/post.schema';
import { PostRepositoryImpl } from '@modules/post/repositories/post.repository.impl';
import { PostMapper } from '@modules/post/mapper/post.mapper';
import { Event, EventSchema } from '@modules/event/entities/event.schema';
import { EventMember, EventMemberSchema } from '@modules/event/entities/eventmember.schema';
import { IEventMemberRepository } from '@modules/event/repositories/eventmember.repository';
import { EventMemberRepository } from '@modules/event/repositories/eventmember.repository.impl';
import { IEventRepository } from '@modules/event/repositories/event.repository';
import { EventRepositoryImpl } from '@modules/event/repositories/event.repository.impl';
import { EventMapper } from '@modules/event/mapper/event.mapper';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Friend.name, schema: FriendSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Profile.name, schema: ProfileSchema },
			{ name: Post.name, schema: PostSchema },
			{ name: Event.name, schema: EventSchema },
			{ name: EventMember.name, schema: EventMemberSchema },
		]),
	],
	providers: [
		{
			provide: IProfileRepository,
			useClass: ProfileRepositoryImpl,
		},
		{
			provide: IUserRepository,
			useClass: UserRepositoryImpl,
		},
		{
			provide: IPostRepository,
			useClass: PostRepositoryImpl,
		},
		{
			provide: IEventMemberRepository,
			useClass: EventMemberRepository,
		},
		{
			provide: IEventRepository,
			useClass: EventRepositoryImpl,
		},
		PostMapper,
		EventMapper,
	],
	exports: [
		MongooseModule,
		IProfileRepository,
		IUserRepository,
		IPostRepository,
		IEventMemberRepository,
		IEventRepository,
		PostMapper,
		EventMapper,
	],
})
export class SharedModule {}
