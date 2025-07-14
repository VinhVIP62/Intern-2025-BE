import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { IPostRepository } from './repositories/post.repository';
import { PostService } from './providers/post.service';
import { PostController } from './controllers/post.controller';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { IReactRepository } from './repositories/react.repository';
import { ReactRepositoryImpl } from './repositories/react.repository.impl';
import { ReactService } from './providers/react.post.service';
import { React, ReactSchema } from './entities/react.post.schema';
import { ReactController } from './controllers/react.controller';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { FriendRepository } from '@modules/friend/repositories/friend.repository.impl';
import { SharedModule } from 'src/shared/shared.module';
import { CmtMapper } from './mapper/cmt.mapper';
import { ReactCmtController } from './controllers/react.cmt.controller';
import { ReactCmtService } from './providers/react.cmt.service';
import { IReactCommentRepository } from './repositories/react.comment.repository';
import { ReactCommentRepositoryImpl } from './repositories/react.comment.repository.impl';
import { ICommentRepository } from './repositories/comment.repository';
import { CommentRepositoryImpl } from './repositories/comment.repository.impl';
import { ReactComment, ReactCommentSchema } from './entities/react.comment.schema';
import { CommentService } from './providers/comment.service';
import { Comment, CommentSchema } from './entities/comment.schema';
import { CommentController } from './controllers/comment.controller';
import { PostMapper } from './mapper/post.mapper';
import { SearchModule } from '@modules/search/search.module';

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
	],
	controllers: [PostController, ReactController, ReactCmtController, CommentController],
	exports: [PostService, ReactService, ReactCmtService],
})
export class PostModule {}
