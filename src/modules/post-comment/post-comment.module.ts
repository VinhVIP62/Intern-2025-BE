import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { CommentModule } from '@modules/comment';
import { PostModule } from '@modules/post/post.module';

import { FileHostModule } from '@shared/modules';

import { PostCommentController } from './controllers';

/** Exact duplicate of CommentExtensionModule, only used for routing */
@Module({
	imports: [CommentModule, PostModule, FileHostModule, NestjsFormDataModule],
	controllers: [PostCommentController],
})
export class PostCommentModule {}
