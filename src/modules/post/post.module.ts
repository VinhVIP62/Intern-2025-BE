import { Module } from '@nestjs/common';
import { PostController } from './controllers/post.controller';
import { PostService } from './providers/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { IPostRepository } from './repositories/post.repository';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { UploadModule } from 'src/shared/upload/upload.module';
import { CommentRepositoryImpl } from './repositories/comment.repository.impl';
import { ICommentRepository } from './repositories/comment.repository';
import { Comment, CommentSchema } from './entities/comment.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Post.name,
				schema: PostSchema,
			},
			{
				name: Comment.name,
				schema: CommentSchema,
			},
		]),
		UploadModule,
	],
	controllers: [PostController],
	providers: [
		PostService,
		{
			provide: IPostRepository,
			useClass: PostRepositoryImpl,
		},
		{
			provide: ICommentRepository,
			useClass: CommentRepositoryImpl,
		},
	],
	exports: [
		PostService,
		{
			provide: IPostRepository,
			useClass: PostRepositoryImpl,
		},
		{
			provide: ICommentRepository,
			useClass: CommentRepositoryImpl,
		},
	],
})
export class PostModule {}
