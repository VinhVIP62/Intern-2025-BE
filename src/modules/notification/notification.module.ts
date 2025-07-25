import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './providers/notification.service';
import { Notification, NotificationSchema } from './entities/notification.schema';
import { INotificationRepository } from './repositories/notification.repository';
import { NotificationRepositoryImpl } from './repositories/notification.repository.impl';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { UserRepositoryImpl } from '@modules/user/repositories/user.repository.impl';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { Group, GroupSchema } from '@modules/group/entities/group.schema';
import { Post, PostSchema } from '@modules/post/entities/post.schema';
import { Comment, CommentSchema } from '@modules/comment/entities/comment.schema';
import { IGroupRepository } from '@modules/group/repositories/group.repository';
import { GroupRepositoryImpl } from '@modules/group/repositories/group.repository.impl';
import { IPostRepository } from '@modules/post/repositories/post.repository';
import { PostRepositoryImpl } from '@modules/post/repositories/post.repository.impl';
import { ICommentRepository } from '@modules/comment/interfaces/comment.repository';
import { CommentRepositoryImpl } from '@modules/comment/repositories/comment.repository.impl';
import { IEventRepository } from '@modules/event/repositories/event.repository';
import { EventRepositoryImpl } from '@modules/event/repositories/event.repository.impl';
import { IAchievementRepository } from '@modules/achievement/interfaces/achievement.repository';
import { AchievementRepositoryImpl } from '@modules/achievement/repositories/achievement.repository.impl';
import { IFriendRequestRepository } from '@modules/friend-request/repositories/friend-request.repository';
import { FriendRequestRepositoryImpl } from '@modules/friend-request/repositories/friend-request.repository.impl';
import { Achievement, AchievementSchema } from '@modules/achievement/entities/achievement.schema';
import {
	FriendRequest,
	FriendRequestSchema,
} from '@modules/friend-request/entities/friend-request.schema';
import { Event, EventSchema } from '@modules/event/entities/event.schema';
import { EventInvitation } from '@modules/event/entities/event-invitation.schema';
import { EventInvitationSchema } from '@modules/event/entities/event-invitation.schema';
@Module({
	imports: [
		MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
		MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
		MongooseModule.forFeature([{ name: Achievement.name, schema: AchievementSchema }]),
		MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }]),
		MongooseModule.forFeature([{ name: EventInvitation.name, schema: EventInvitationSchema }]),
	],
	controllers: [NotificationController],
	providers: [
		NotificationService,
		{ provide: INotificationRepository, useClass: NotificationRepositoryImpl },
		{ provide: IUserRepository, useClass: UserRepositoryImpl },
		{ provide: IGroupRepository, useClass: GroupRepositoryImpl },
		{ provide: IPostRepository, useClass: PostRepositoryImpl },
		{ provide: ICommentRepository, useClass: CommentRepositoryImpl },
		{ provide: IEventRepository, useClass: EventRepositoryImpl },
		{ provide: IAchievementRepository, useClass: AchievementRepositoryImpl },
		{ provide: IFriendRequestRepository, useClass: FriendRequestRepositoryImpl },
	],
	exports: [NotificationService],
})
export class NotificationModule {}
