import { Module } from '@nestjs/common';
import { PostController } from './controllers/post.controller';
import { PostService } from './providers/post.service';

@Module({
	controllers: [PostController],
	providers: [PostService],
})
export class PostModule {}
