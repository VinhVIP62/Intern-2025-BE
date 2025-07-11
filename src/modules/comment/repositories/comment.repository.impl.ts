import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { MongooseRepositoryImpl } from '@common/crud/repos';
import { SORT } from '@common/enums';
import { EntityNotFound } from '@common/exceptions';
import { CursorPaginationOption } from '@common/types/data';

import { Comment } from '../entities';
import { ICommentRepository } from './comment.repository';

@Injectable()
export class CommentRepositoryImpl
	extends MongooseRepositoryImpl<Comment>
	implements ICommentRepository
{
	constructor(@InjectModel(Comment.name) private readonly commentModel: Model<Comment>) {
		super(commentModel, Comment, {
			populate: ['userId', 'childrenCount_'],
		});
	}

	async findCommentsCursorPaginated(
		targetId: string,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<Comment>[]> {
		const foundEntities: WithPopulated<Comment>[] = [];
		const query = this.commentModel
			.find({
				targetId,
				...(options?.cursor && this.transformFilter({ id: options?.cursor })),
			})
			.sort(
				this.transformSort({
					customRepoOptions: {
						sort: { createdAt: SORT.ASC },
					},
				}),
			)
			.limit(options?.limit || 10)
			.populate(this.transformPopulate());
		const cursor = query.cursor();

		for await (const comment of cursor) {
			foundEntities.push(comment.toObject());
		}

		return foundEntities;
	}

	async deleteSelfAndDescendants(options: Partial<Comment> & Pick<Comment, 'id'>): Promise<number> {
		const where = this.transformFilter(options);
		const session = await this.commentModel.startSession();
		const deleteResult = session
			.withTransaction(async () => {
				const result = await this.commentModel
					.aggregate([
						{ $match: { ...where } },
						{
							$graphLookup: {
								from: this.commentModel.collection.name,
								startWith: '$_id',
								connectFromField: '_id',
								connectToField: 'targetId',
								as: 'descendants',
							},
						},
						{
							$project: {
								'descendants._id': 1,
							},
						},
					])
					.session(session);

				if (!result.length) throw new EntityNotFound(Comment);
				const descendants = (
					result as { descendants: { _id: mongoose.Types.ObjectId }[] }[]
				)[0].descendants.map(d => d._id);
				return await this.commentModel
					.deleteMany({ _id: { $in: descendants.concat([where._id]) } }, { session })
					.exec();
			})
			.then(async comment => {
				await session.endSession();
				return comment;
			});
		return (await deleteResult).deletedCount;
	}
}
