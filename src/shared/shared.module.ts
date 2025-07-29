import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from '@modules/friend/entities/friend.schema';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { Profile, ProfileSchema } from '@modules/user/entities/profile.schema';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { ProfileRepositoryImpl } from '@modules/user/repositories/implements/profile.repository.impl';
import { IUserRepository } from '@modules/user/repositories/interfaces/user.repository';
import { UserRepositoryImpl } from '@modules/user/repositories/implements/user.repository.impl';
import { IPostRepository } from '@modules/post/repositories/interfaces/post.repository';
import { Post, PostSchema } from '@modules/post/entities/post.schema';
import { PostRepositoryImpl } from '@modules/post/repositories/implements/post.repository.impl';
import { PostMapper } from '@modules/post/mapper/post.mapper';
import { Event, EventSchema } from '@modules/event/entities/event.schema';
import { EventMember, EventMemberSchema } from '@modules/event/entities/eventmember.schema';
import { IEventMemberRepository } from '@modules/event/repositories/eventmember.repository';
import { EventMemberRepository } from '@modules/event/repositories/eventmember.repository.impl';
import { IEventRepository } from '@modules/event/repositories/event.repository';
import { EventRepositoryImpl } from '@modules/event/repositories/event.repository.impl';
import { EventMapper } from '@modules/event/mapper/event.mapper';
import { React, ReactSchema } from '@modules/post/entities/react.post.schema';
import { ReactComment, ReactCommentSchema } from '@modules/post/entities/react.comment.schema';
import { IReactCommentRepository } from '@modules/post/repositories/interfaces/react.comment.repository';
import { ReactCommentRepositoryImpl } from '@modules/post/repositories/implements/react.comment.repository.impl';
import { IReactRepository } from '@modules/post/repositories/interfaces/react.repository';
import { ReactRepositoryImpl } from '@modules/post/repositories/implements/react.repository.impl';
import { TaggedUserMapper } from '@modules/post/mapper/taggedUser.mapper';
import { INotificationRepository } from '@modules/notification/repositories/notification.repository';
import { NotificationRepositoryImpl } from '@modules/notification/repositories/notification.repository.impl';
import { NotificationMapper } from '@modules/notification/mapper/notification.mapper';
import { ChatService } from '@modules/chat/providers/chat.service';
import { MessageMapper } from '@modules/chat/mapper/message.mapper';
import {
	Notification,
	NotificationSchema,
} from '@modules/notification/entities/notification.schema';
import { Message, MessageSchema } from '@modules/chat/entities/message.schema';
import { IMessageRepository } from '@modules/chat/repositories/interface/message.repository';
import { MessageRepositoryImpl } from '@modules/chat/repositories/impl/message.repository.impl';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Friend.name, schema: FriendSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Profile.name, schema: ProfileSchema },
			{ name: Post.name, schema: PostSchema },
			{ name: Event.name, schema: EventSchema },
			{ name: EventMember.name, schema: EventMemberSchema },
			{ name: React.name, schema: ReactSchema },
			{ name: ReactComment.name, schema: ReactCommentSchema },
			{ name: Notification.name, schema: NotificationSchema },
			{ name: Message.name, schema: MessageSchema },
		]),
		ChatModule,
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
		{
			provide: IReactCommentRepository,
			useClass: ReactCommentRepositoryImpl,
		},
		{
			provide: IReactRepository,
			useClass: ReactRepositoryImpl,
		},
		{
			provide: INotificationRepository,
			useClass: NotificationRepositoryImpl,
		},
		{
			provide: IMessageRepository,
			useClass: MessageRepositoryImpl,
		},
		NotificationMapper,
		PostMapper,
		EventMapper,
		TaggedUserMapper,
		MessageMapper,
		ChatService,
	],
	exports: [
		MongooseModule,
		IProfileRepository,
		IUserRepository,
		IPostRepository,
		IEventMemberRepository,
		IEventRepository,
		INotificationRepository,
		PostMapper,
		EventMapper,
		TaggedUserMapper,
		NotificationMapper,
	],
})
export class SharedModule {}
