import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { PostController } from './controllers/post.controller';
import { PostService } from './providers/post.service';
import { IPostRepository } from './repositories/post.repository';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { FileModule } from '../file/file.module';
import { NotificationModule } from '../notification/notification.module';
import { UserSchema } from '@modules/user/entities/user.schema';
import { User } from '@modules/user/entities/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		FileModule,
		NotificationModule,
	],
	controllers: [PostController],
	providers: [PostService, { provide: IPostRepository, useClass: PostRepositoryImpl }],
	exports: [PostService],
})
export class PostModule {}
