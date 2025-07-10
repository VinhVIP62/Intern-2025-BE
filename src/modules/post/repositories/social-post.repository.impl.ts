import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl } from '@common/crud/repos';
import { Visibility } from '@common/enums';
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
			populate: ['userId', 'deletedBy', 'visibleToUsersIds', 'invisibleToUsersIds'],
		});
	}

	async fetchPost(id: string, userId: string): Promise<WithPopulated<SocialPost> | null> {
		const userObjectId = new mongoose.Types.ObjectId(userId);
		const foundPost =
			(
				await this.postModel
					.findOne(
						this.transformFilter({
							id,
							$or: [
								{ visibility: Visibility.PUBLIC },
								{
									visibility: Visibility.LIMITED,
									visibleToUsersIds: { $in: [userObjectId] },
								},
							],
						}),
					)
					.populate(this.transformPopulate())
					.exec()
			)?.toObject() || null;
		return foundPost;
	}

	async fetchFeed(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<WithPopulated<SocialPost>[]> {
		const userObjectId = new mongoose.Types.ObjectId(userId);
		const cursorPost = options?.cursor ? await this.findOneByIdOrFail(options.cursor) : undefined;
		const filter: FilterQuery<SocialPost> = {
			$and: [
				{
					$or: [
						{ visibility: Visibility.PUBLIC },
						{
							visibility: Visibility.LIMITED,
							visibleToUsersIds: { $in: [userObjectId] },
						},
					],
				},
			],
		};
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
