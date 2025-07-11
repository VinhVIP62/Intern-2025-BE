import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { PostModule } from '@modules/post';

import { CaslModule, FileHostModule } from '@shared/modules';

import { PostCommentController } from '../post-comment/controllers';
import { Comment, CommentSchema } from './entities';
import { CommentService } from './providers';
import { CommentRepositoryImpl, ICommentRepositoryToken } from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Comment.name,
				schema: CommentSchema,
			},
		]),
		FileHostModule,
		NestjsFormDataModule,
		PostModule,
		CaslModule,
	],
	controllers: [PostCommentController],
	providers: [
		CommentService,
		{
			provide: ICommentRepositoryToken,
			useClass: CommentRepositoryImpl,
		},
	],
	exports: [CommentService],
})
export class CommentModule {}
