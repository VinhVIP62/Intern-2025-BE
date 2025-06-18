import { Injectable } from '@nestjs/common';
import { IPostRepository } from './post.repository';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {}
