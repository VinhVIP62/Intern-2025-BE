import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.schema';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './providers/comment.service';
import { ICommentRepository } from './repositories/comment.repository';
import { CommentRepositoryImpl } from './repositories/comment.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }])],
	controllers: [CommentController],
	providers: [CommentService, { provide: ICommentRepository, useClass: CommentRepositoryImpl }],
	exports: [CommentService],
})
export class CommentModule {}
