import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { PostController } from './controllers/post.controller';
import { PostService } from './providers/post.service';
import { IPostRepository } from './repositories/post.repository';
import { PostRepositoryImpl } from './repositories/post.repository.impl';
import { FileModule } from '../file/file.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]), FileModule],
	controllers: [PostController],
	providers: [PostService, { provide: IPostRepository, useClass: PostRepositoryImpl }],
	exports: [PostService],
})
export class PostModule {}
