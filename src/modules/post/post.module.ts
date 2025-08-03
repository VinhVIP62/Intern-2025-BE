import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { IPostRepository } from './repositories/interfaces/post.repository';
import { PostService } from './providers/post.service';
import { PostController } from './controllers/post.controller';
import { PostRepositoryImpl } from './repositories/implements/post.repository.impl';
import { IReactRepository } from './repositories/interfaces/react.repository';
import { ReactRepositoryImpl } from './repositories/implements/react.repository.impl';
import { ReactService } from './providers/react.post.service';
import { React, ReactSchema } from './entities/react.post.schema';
import { ReactController } from './controllers/react.controller';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { FriendRepository } from '@modules/friend/repositories/friend.repository.impl';
import { SharedModule } from 'src/shared/shared.module';
import { CmtMapper } from './mapper/cmt.mapper';
import { ReactCmtController } from './controllers/react.cmt.controller';
import { ReactCmtService } from './providers/react.cmt.service';
import { IReactCommentRepository } from './repositories/interfaces/react.comment.repository';
import { ReactCommentRepositoryImpl } from './repositories/implements/react.comment.repository.impl';
import { ICommentRepository } from './repositories/interfaces/comment.repository';
import { CommentRepositoryImpl } from './repositories/implements/comment.repository.impl';
import { ReactComment, ReactCommentSchema } from './entities/react.comment.schema';
import { CommentService } from './providers/comment.service';
import { Comment, CommentSchema } from './entities/comment.schema';
import { CommentController } from './controllers/comment.controller';
import { PostMapper } from './mapper/post.mapper';
import { SearchModule } from '@modules/search/search.module';
import { TaggedUserMapper } from './mapper/taggedUser.mapper';
import { NotificationModule } from '@modules/notification/notification.module';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationMapper } from '@modules/notification/mapper/notification.mapper';
import { SocketModule } from 'src/websocket/socket.module';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Post.name, schema: PostSchema },
			{ name: React.name, schema: ReactSchema },
			{ name: ReactComment.name, schema: ReactCommentSchema },
			{ name: Comment.name, schema: CommentSchema },
		]),
		SharedModule,
		SearchModule,
		NotificationModule,
		SocketModule,
		ChatModule,
	],
	providers: [
		PostService,
		{ provide: IPostRepository, useClass: PostRepositoryImpl },
		{ provide: IReactRepository, useClass: ReactRepositoryImpl },
		{ provide: IFriendRepository, useClass: FriendRepository },
		{ provide: IReactCommentRepository, useClass: ReactCommentRepositoryImpl },
		{ provide: ICommentRepository, useClass: CommentRepositoryImpl },
		ReactService,
		ReactCmtService,
		CommentService,
		CmtMapper,
		PostMapper,
		TaggedUserMapper,
		NotificationService,
		NotificationMapper,
	],
	controllers: [PostController, ReactController, ReactCmtController, CommentController],
	exports: [PostService, ReactService, ReactCmtService, IPostRepository],
})
export class PostModule {}
