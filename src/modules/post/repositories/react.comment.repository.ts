import { Injectable } from '@nestjs/common';
import { ReactComment } from '../entities/react.comment.schema';
import { ReactType } from '@common/enum/react.type.enum';

@Injectable()
export abstract class IReactCommentRepository {
	abstract reactComment(userId: string, cmtId: string, type: ReactType): Promise<ReactComment>;
	abstract unReactComment(userId: string, cmtId: string): Promise<ReactComment | null>;
	abstract isReacted(userId: string, cmtId: string): Promise<boolean>;
}
