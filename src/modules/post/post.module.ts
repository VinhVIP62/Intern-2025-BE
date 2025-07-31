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
import { SavedPostListRepositoryImpl } from './repositories/saved-post-list.repository.impl';
import { ISavedPostListRepository } from './repositories/saved-post-list.repository';
import { SavedPostController } from './controllers/saved-post.controller';
import { SavedPostList, SavedPostListSchema } from './entities/saved-post-list.schema';
import { SavedPostItem, SavedPostItemSchema } from './entities/saved-post-item.schema';
import { SavedPostService } from './providers/saved-post.service';
import { ISavedPostItemRepository } from './repositories/saved-post-item.repository';
import { SavedPostItemRepositoryImpl } from './repositories/saved-post-item.repository.impl';
import { NotificationModule } from '@modules/notification/notification.module';
import { RealtimeModule } from '@modules/realtime/realtime.module';
import { BlockModule } from '@modules/block/block.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Post.name, schema: PostSchema },
			{ name: Comment.name, schema: CommentSchema },
			{ name: Like.name, schema: LikeSchema },
			{ name: SavedPostList.name, schema: SavedPostListSchema },
			{ name: SavedPostItem.name, schema: SavedPostItemSchema },
		]),
		FileModule,
		LoggerModule,
		UserModule,
		ElasticModule,
		FriendModule,
		NotificationModule,
		RealtimeModule,
		BlockModule,
	],
	controllers: [PostController, CommentController, LikeController, SavedPostController],
	providers: [
		PostService,
		CommentService,
		LikeService,
		SavedPostService,
		{ provide: IPostRepository, useClass: PostRepositoryImpl },
		{ provide: ICommentRepository, useClass: CommentRepositoryImpl },
		{ provide: ILikeRepository, useClass: LikeRepositoryImpl },
		{ provide: ISavedPostListRepository, useClass: SavedPostListRepositoryImpl },
		{ provide: ISavedPostItemRepository, useClass: SavedPostItemRepositoryImpl },
	],
	exports: [PostService],
})
export class PostModule {}
