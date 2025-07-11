import { WithPopulated } from '@common/crud/entities';
import { IBaseRepository, QueryOptions } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { Comment } from '../entities';

export interface ICommentRepository extends IBaseRepository<Comment> {
	create(
		data: Partial<Comment> & Pick<Comment, 'targetId' | 'userId'>,
		queryOptions?: QueryOptions<Comment>,
	): Promise<WithPopulated<Comment>>;

	findCommentsCursorPaginated(
		targetId: string,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<Comment>[]>;
	deleteSelfAndDescendants(options: Partial<Comment>): Promise<number>;
}

export const ICommentRepositoryToken = Symbol('ICommentRepository');
