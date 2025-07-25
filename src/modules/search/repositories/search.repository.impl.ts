import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@modules/user/entities/user.schema';
import { Post } from '@modules/post/entities/post.schema';
import { Event } from '@modules/event/entities/event.schema';
import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';
import { ISearchRepository } from '../interfaces/search.repository';
import { PostStatus } from '@modules/post/entities/post.enum';
import { Group } from '@modules/group/entities/group.schema';
@Injectable()
export class SearchRepositoryImpl implements ISearchRepository {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Post.name) private readonly postModel: Model<Post>,
		@InjectModel(Event.name) private readonly eventModel: Model<Event>,
		@InjectModel(Group.name) private readonly groupModel: Model<Group>,
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
			const orConditions: any[] = [{ fullName: regex }, { firstName: regex }, { lastName: regex }];

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
				.populate('authorUser', 'firstName lastName avatar fullName')
				.populate('event', 'title description')
				.populate('group', 'name description')
				.populate('sharedFromPost')
				.populate({
					path: 'sharedPostsList',
					select: 'author',
					populate: {
						path: 'authorUser',
						select: 'firstName lastName avatar fullName',
					},
				})
				.populate({
					path: 'taggedUsersList',
					select: 'firstName lastName avatar fullName',
				})
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
		const skip = (page - 1) * limit;
		const filter: any = {};
		if (key) {
			const regex = new RegExp(key, 'i');
			filter.$or = [{ title: regex }, { description: regex }];
		}
		if (sportType) {
			filter.sport = sportType;
		}
		if (timeRange && timeRange !== 'all') {
			const now = new Date();
			let daysAgo = 7;
			if (timeRange === '30d') daysAgo = 30;
			else if (timeRange === '90d') daysAgo = 90;
			const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
			filter.startDate = { $gte: startDate };
		}
		const [events, total] = await Promise.all([
			this.eventModel
				.find(filter)
				.skip(skip)
				.limit(limit)
				.populate({
					path: 'organizer',
					select: 'firstName lastName avatar fullName name description',
				})
				.lean(),
			this.eventModel.countDocuments(filter),
		]);
		return { events, total };
	}

	async searchGroups(
		key?: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ groups: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = {};
		if (key) {
			const regex = new RegExp(key, 'i');
			filter.$or = [{ name: regex }, { description: regex }];
		}
		const [groups, total] = await Promise.all([
			this.groupModel.find(filter).skip(skip).limit(limit).lean(),
			this.groupModel.countDocuments(filter),
		]);
		const mappedGroups = groups.map(group => {
			const g = group as any;
			return {
				_id: g._id.toString(),
				name: g.name,
				description: g.description,
				avatar: g.avatar,
				coverImage: g.coverImage,
				admins: g.admins?.map((id: any) => id.toString()) || [],
				members: g.members?.map((id: any) => id.toString()) || [],
				waitingList: g.waitingList?.map((id: any) => id.toString()) || [],
				inviteList: g.inviteList?.map((id: any) => id.toString()) || [],
				sport: g.sport,
				location: g.location,
				isPrivate: g.isPrivate,
				memberCount: g.memberCount,
				requirePostApproval: g.requirePostApproval,
				autoApproveJoinGroup: g.autoApproveJoinGroup,
				joinConditions: g.joinConditions,
				createdAt: g.createdAt,
				updatedAt: g.updatedAt,
			};
		});
		return { groups: mappedGroups, total };
	}

	async searchHashtags(
		key?: string,
		page: number = 1,
		limit: number = 10,
		timeRange?: string,
	): Promise<{ hashtags: any[]; total: number }> {
		const skip = (page - 1) * limit;
		if (!key) {
			return { hashtags: [], total: 0 };
		}
		// Ensure hashtag starts with #
		const hashtag = key.startsWith('#') ? key : `#${key}`;
		const filter: any = {
			approvalStatus: PostStatus.APPROVED,
			hashtags: hashtag,
		};
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
				.populate('authorUser', 'firstName lastName avatar fullName')
				.populate('event', 'title description')
				.populate('group', 'name description')
				.populate('sharedFromPost')
				.populate({
					path: 'sharedPostsList',
					select: 'author',
					populate: {
						path: 'authorUser',
						select: 'firstName lastName avatar fullName',
					},
				})
				.populate({
					path: 'taggedUsersList',
					select: 'firstName lastName avatar fullName',
				})
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean({ virtuals: true }),
			this.postModel.countDocuments(filter),
		]);
		return { hashtags: posts, total };
	}

	async searchLocations(
		key?: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ users: any[]; total: number }> {
		const skip = (page - 1) * limit;
		const filter: any = {};

		if (key) {
			const regex = new RegExp(key, 'i');
			filter.$or = [
				{ 'location.city': regex },
				{ 'location.district': regex },
				{ 'location.address': regex },
			];
		}

		const [users, total] = await Promise.all([
			this.userModel.find(filter).skip(skip).limit(limit).lean({ virtuals: true }),
			this.userModel.countDocuments(filter),
		]);

		return { users, total };
	}
}
