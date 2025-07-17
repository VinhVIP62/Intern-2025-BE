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
import { ICommentRepository } from '@modules/comment/repositories/comment.repository';
import { CommentRepositoryImpl } from '@modules/comment/repositories/comment.repository.impl';
@Module({
	imports: [
		MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
	],
	controllers: [NotificationController],
	providers: [
		NotificationService,
		{ provide: INotificationRepository, useClass: NotificationRepositoryImpl },
		{ provide: IUserRepository, useClass: UserRepositoryImpl },
		{ provide: IGroupRepository, useClass: GroupRepositoryImpl },
		{ provide: IPostRepository, useClass: PostRepositoryImpl },
		{ provide: ICommentRepository, useClass: CommentRepositoryImpl },
	],
	exports: [NotificationService],
})
export class NotificationModule {}
