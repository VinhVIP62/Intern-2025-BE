import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { PostService } from './providers/post.service';
import { PostController } from './controllers/post.controller';
import { IPostRepository } from './repositories/post.repository';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { LoggerModule } from '@common/logger/logger.module';
import { FileModule } from '@modules/file/file.module';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './providers/comment.service';
import { ICommentRepository } from './repositories/comment.repository';
import { CommentRepositoryImpl } from './repositories/comment.repository.impl';
import { Comment, CommentSchema } from './entities/comment.schema';
import { Like, LikeSchema } from './entities/like.schema';
import { LikeService } from './providers/like.service';
import { ILikeRepository } from './repositories/like.repository';
import { LikeRepositoryImpl } from './repositories/like.repository.impl';
import { LikeController } from './controllers/like.controller';
import { UserModule } from '@modules/user/user.module';
import { ElasticModule } from '@modules/elastic/elastic.module';
import { FriendModule } from '@modules/friend/friend.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Post.name, schema: PostSchema },
			{ name: Comment.name, schema: CommentSchema },
			{ name: Like.name, schema: LikeSchema },
		]),
		FileModule,
		LoggerModule,
		UserModule,
		ElasticModule,
		FriendModule,
	],
	controllers: [PostController, CommentController, LikeController],
	providers: [
		PostService,
		CommentService,
		LikeService,
		{ provide: IPostRepository, useClass: PostRepositoryImpl },
		{ provide: ICommentRepository, useClass: CommentRepositoryImpl },
		{ provide: ILikeRepository, useClass: LikeRepositoryImpl },
	],
	exports: [PostService],
})
export class PostModule {}
