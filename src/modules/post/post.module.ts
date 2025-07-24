import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { PostController } from './controllers/post.controller';
import { PostService } from './providers/post.service';
import { IPostRepository } from './repositories/post.repository';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { FileModule } from '@modules/file/file.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { UserSchema } from '@modules/user/entities/user.schema';
import { User } from '@modules/user/entities/user.schema';
import { UserModule } from '@modules/user/user.module';
import { CommentModule } from '@modules/comment/comment.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		FileModule,
		NotificationModule,
		UserModule,
		CommentModule,
	],
	controllers: [PostController],
	providers: [PostService, { provide: IPostRepository, useClass: PostRepositoryImpl }],
	exports: [PostService],
})
export class PostModule {}
