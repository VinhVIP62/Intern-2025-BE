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

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Post.name, schema: PostSchema },
			{ name: React.name, schema: ReactSchema },
		]),
		SharedModule,
	],
	providers: [
		PostService,
		{ provide: IPostRepository, useClass: PostRepositoryImpl },
		{ provide: IReactRepository, useClass: ReactRepositoryImpl },
		{ provide: IFriendRepository, useClass: FriendRepository },
		ReactService,
	],
	controllers: [PostController, ReactController],
	exports: [PostService, ReactService],
})
export class PostModule {}
