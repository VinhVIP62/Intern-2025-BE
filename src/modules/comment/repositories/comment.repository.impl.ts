import { Injectable } from '@nestjs/common';
import { ICommentRepository } from './comment.repository';

@Injectable()
export class CommentRepositoryImpl implements ICommentRepository {}
