import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl } from '@common/crud/repos';
import { CursorPaginationOption } from '@common/types/data';

import { SocialPost } from '../entities';
import { IPostRepository } from './social-post.repository';

@Injectable()
export class PostRepositoryImpl
	extends MongooseSoftDeleteRepositoryImpl<SocialPost>
	implements IPostRepository
{
	constructor(@InjectModel(SocialPost.name) private readonly postModel: Model<SocialPost>) {
		super(postModel, SocialPost, {
			populate: ['userId', 'deletedBy', 'visibleToUsersIds', 'invisibleToUsersIds', 'parentPostId'],
		});
	}

	async fetchFeed(
		where: Partial<SocialPost>,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<SocialPost>[]> {
		const cursorPost = options?.cursor ? await this.findOneByIdOrFail(options.cursor) : undefined;
		const filter: FilterQuery<SocialPost> = where;
		if (cursorPost) {
			filter.$and!.push({
				$or: [
					{ createdAt: { $lt: cursorPost.createdAt } },
					{
						createdAt: cursorPost.createdAt,
						_id: { $lt: new mongoose.Types.ObjectId(cursorPost.id) },
					},
				],
			});
		}
		const foundPosts = (
			await this.postModel
				.find(this.transformFilter(filter))
				.sort({ createdAt: -1, _id: -1 })
				.limit(options?.limit || 10)
				.populate(this.transformPopulate())
				.exec()
		).map(p => p.toObject());
		return await Promise.all(foundPosts);
	}
}
