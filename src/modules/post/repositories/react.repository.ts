import { Injectable } from '@nestjs/common';
import { React } from '../entities/react.post.schema';
import { ReactType } from '@common/enum/react.type.enum';

@Injectable()
export abstract class IReactRepository {
	abstract reactPost(userId: string, postId: string, type: ReactType): Promise<React>;
	abstract unReactPost(userId: string, postId: string): Promise<React | null>;
	abstract isReacted(userId: string, postId: string): Promise<boolean>;
}
