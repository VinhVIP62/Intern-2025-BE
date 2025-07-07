import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { MongooseSoftDeleteRepositoryImpl } from '@common/crud/repos';
import { Visibility } from '@common/enums';

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
		const foundPost = await this.postModel
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
			.populate(this.transformPopulate());
		return foundPost;
	}
}
