import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@modules/user/entities/user.schema';
import { Post } from '@modules/post/entities/post.schema';
import { Event } from '@modules/event/entities/event.schema';
import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';
import { ISearchRepository } from './search.repository';
import { PostStatus } from '@modules/post/entities/post.enum';
@Injectable()
export class SearchRepositoryImpl implements ISearchRepository {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Post.name) private readonly postModel: Model<Post>,
		@InjectModel(Event.name) private readonly eventModel: Model<Event>,
	) {}

	async searchUsers(
		key?: string,
		sportType?: SportType,
		level?: ActivityLevel,
		page: number = 1,
		limit: number = 10,
	): Promise<{ users: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = {};
		if (key) {
			const regex = new RegExp(key, 'i');
			const orConditions: any[] = [
				{ fullName: regex },
				{ firstName: regex },
				{ lastName: regex },
				{ 'location.city': regex },
				{ 'location.district': regex },
				{ 'location.address': regex },
			];

			// Check if key is a valid email
			const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
			const phonePattern = /^\d{8,}$/;
			if (emailPattern.test(key)) {
				filter.email = key; // exact match
			} else if (phonePattern.test(key)) {
				filter.phone = key; // exact match
			} else {
				filter.$or = orConditions;
			}
		}
		if (sportType) {
			filter.favoritesSports = sportType;
		}
		if (level && sportType) {
			// convert sportType to capitalizedSportType
			const capitalizedSportType =
				sportType.charAt(0).toUpperCase() + sportType.slice(1).toLowerCase();
			filter[`skillLevels.${capitalizedSportType}`] = level;
		}
		const [users, total] = await Promise.all([
			this.userModel.find(filter).skip(skip).limit(limit).lean({ virtuals: true }),
			this.userModel.countDocuments(filter),
		]);
		return { users, total };
	}

	async searchPosts(
		key?: string,
		sportType?: SportType,
		page: number = 1,
		limit: number = 10,
		timeRange?: string,
	): Promise<{ posts: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = { approvalStatus: PostStatus.APPROVED };
		if (key) {
			const regex = new RegExp(key, 'i');
			filter.$or = [{ content: regex }, { hashtags: regex }, { type: regex }, { sport: regex }];
		}
		if (sportType) {
			filter.sport = sportType;
		}
		// Time range filter
		if (timeRange && timeRange !== 'all') {
			const now = new Date();
			let daysAgo = 7;
			if (timeRange === '30d') daysAgo = 30;
			else if (timeRange === '90d') daysAgo = 90;
			const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
			filter.createdAt = { $gte: startDate };
		}
		const [posts, total] = await Promise.all([
			this.postModel
				.find(filter)
				.sort({ likeCount: -1, commentCount: -1, shareCount: -1, createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean({ virtuals: true }),
			this.postModel.countDocuments(filter),
		]);
		return { posts, total };
	}

	async searchEvents(
		key?: string,
		sportType?: SportType,
		page: number = 1,
		limit: number = 10,
		timeRange?: string,
	): Promise<{ events: any[]; total: number }> {
		// TODO: Implement event search logic
		return { events: [], total: 0 };
	}

	async searchGroups(
		key?: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ groups: any[]; total: number }> {
		// TODO: Implement group search logic
		return { groups: [], total: 0 };
	}

	async searchHashtags(
		key?: string,
		page: number = 1,
		limit: number = 10,
		timeRange?: string,
	): Promise<{ hashtags: any[]; total: number }> {
		// TODO: Implement hashtag search logic (aggregate hashtags from posts)
		return { hashtags: [], total: 0 };
	}

	async searchLocations(
		key?: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ locations: any[]; total: number }> {
		// TODO: Implement location search logic
		return { locations: [], total: 0 };
	}
}
