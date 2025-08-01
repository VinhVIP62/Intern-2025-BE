import { Module } from '@nestjs/common';
import { PostController } from './controllers/post.controller';
import { PostService } from './providers/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { IPostRepository } from './repositories/post.repository';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { UploadModule } from '@modules/upload/upload.module';
import { CommentRepositoryImpl } from './repositories/comment.repository.impl';
import { ICommentRepository } from './repositories/comment.repository';
import { Comment, CommentSchema } from './entities/comment.schema';
import { CommentGateway } from './gateway/post.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { JwtAccessConfig } from '@configs/index';
import { LikePost, LikePostSchema } from './entities/likePost.schema';
import { LikeComment, LikeCommentSchema } from './entities/likeCmt.schema';
import { ILikePostRepository } from './repositories/likePost.repository';
import { LikePostRepositoryImpl } from './repositories/likePost.repository.impl';
import { ILikeCommentRepository } from './repositories/likeComment.repository';
import { LikeCommentRepositoryImpl } from './repositories/likeComment.repository.impl';
import { FriendModule } from '../friend/friend.module';

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
			{
				name: LikePost.name,
				schema: LikePostSchema,
			},
			{
				name: LikeComment.name,
				schema: LikeCommentSchema,
			},
		]),
		JwtModule,
		UploadModule,
		FriendModule,
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
		{
			provide: ILikePostRepository,
			useClass: LikePostRepositoryImpl,
		},
		{
			provide: ILikeCommentRepository,
			useClass: LikeCommentRepositoryImpl,
		},
		CommentGateway,
		{
			inject: [ConfigService],
			provide: 'JWT_ACCESS_TOKEN',
			useFactory: (configService: ConfigService<IEnvVars>) => {
				const config = JwtAccessConfig(configService);
				return new JwtService(config);
			},
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
		{
			provide: ILikePostRepository,
			useClass: LikePostRepositoryImpl,
		},
		{
			provide: ILikeCommentRepository,
			useClass: LikeCommentRepositoryImpl,
		},
	],
})
export class PostModule {}
