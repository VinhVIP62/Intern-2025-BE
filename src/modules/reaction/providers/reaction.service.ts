import { Inject, Injectable } from '@nestjs/common';

import { WithPopulated } from '@common/crud/entities';
import { CursorPaginationOption } from '@common/types/data';

import { Reaction } from '../entities';
import { IReactionRepository, IReactionRepositoryToken, ReactionCount } from '../repositories';

export type PaginatedReactionUsersListWithCursor = {
	foundUsers: Reaction[];
	nextCursor: string;
};

@Injectable()
export class ReactionService {
	constructor(
		@Inject(IReactionRepositoryToken) private readonly reactionRepository: IReactionRepository,
	) {}

	async upsertReaction(
		options: Pick<Reaction, 'userId' | 'targetId'>,
		value: number,
	): Promise<WithPopulated<Reaction>> {
		return this.reactionRepository.upsert(options, { reactionValue: value });
	}

	async delete(options: Pick<Reaction, 'userId' | 'targetId'>): Promise<WithPopulated<Reaction>> {
		const deletedReaction = this.reactionRepository.findOneByAndDelete(options);
		return deletedReaction;
	}

	async deleteMany(targetIds: string[]): Promise<number> {
		const deletedCount = this.reactionRepository.deleteManyOf(targetIds);
		return deletedCount;
	}

	async getCount(targetIds: string[]): Promise<ReactionCount[]> {
		const count = this.reactionRepository.getCount(targetIds);
		return count;
	}

	async getReactionUsersList(
		targetId: string,
		reactionValue: number,
		options?: CursorPaginationOption<string>,
	): Promise<PaginatedReactionUsersListWithCursor> {
		const usersList = await this.reactionRepository.getReactionUsersList(
			targetId,
			reactionValue,
			options,
		);
		const nextCursor = usersList.at(-1)?.id || '';
		return {
			foundUsers: usersList,
			nextCursor,
		};
	}
}
