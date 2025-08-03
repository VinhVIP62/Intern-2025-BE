import { Injectable } from '@nestjs/common';
import { Comment } from '../../entities/comment.schema';
import { ReactType } from '@common/enum/post/react.type.enum';

@Injectable()
export abstract class ICommentRepository {
	abstract create(comment: Partial<Comment>): Promise<Comment>;
	abstract findByPostId(postId: string, limit: number, before?: Date): Promise<Comment[]>;
	abstract findChildCmt(parentCmtId: string): Promise<Comment[]>;
	abstract existParent(parentId: string): Promise<boolean>;
	abstract childCount(cmtId: string): Promise<number>;
	abstract updateReactCount(cmtId: string, type: ReactType, inc: number): Promise<Comment | null>;
	abstract findById(cmtId: string): Promise<Comment | null>;
}
