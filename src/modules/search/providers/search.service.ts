import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {
	SearchAllQueryDto,
	SearchQueryDto,
	PaginatedSearchResultDto,
	SearchFilterType,
	SearchResultDto,
} from '@modules/search/dto';
import { ISearchRepository } from '@modules/search/interfaces/search.repository';
import { PostService } from '@modules/post/providers/post.service';
import { Types } from 'mongoose';
import { ISearchHistoryRepository } from '@modules/search/interfaces/searchHistory.repository';
import { UserService } from '@modules/user/providers/user.service';
import { GroupService } from '@modules/group/providers/group.service';
import { EventService } from '@modules/event/providers/event.service';

@Injectable()
export class SearchService {
	constructor(
		@Inject(ISearchRepository)
		private readonly searchRepository: ISearchRepository,
		@Inject(forwardRef(() => PostService))
		private readonly postService: PostService,
		@Inject(ISearchHistoryRepository)
		private readonly searchHistoryRepository: ISearchHistoryRepository,
		private readonly userService: UserService,
		private readonly groupService: GroupService,
		private readonly eventService: EventService,
	) {}

	async searchAll(
		query: SearchAllQueryDto,
		userId: string | undefined,
		i18n: I18nContext,
	): Promise<PaginatedSearchResultDto> {
		const { key, page = 1, limit = 10, timeRange } = query;
		// Save search history if userId and key exist
		if (userId && key) {
			const history = await this.searchHistoryRepository.create(new Types.ObjectId(userId), {
				text: key,
			});
		}
		// Parallel search for all types
		const [userRes, postRes, eventRes, groupRes, hashtagRes, locationRes] = await Promise.all([
			this.searchRepository.searchUsers(key, undefined, undefined, page, limit),
			this.searchRepository.searchPosts(key, undefined, page, limit, timeRange),
			this.searchRepository.searchEvents(key, undefined, page, limit, timeRange),
			this.searchRepository.searchGroups(key, page, limit),
			this.searchRepository.searchHashtags(key, page, limit, timeRange),
			this.searchRepository.searchLocations(key, page, limit),
			// Add more as needed
		]);
		const data: SearchResultDto[] = [
			{ type: SearchFilterType.USER, results: userRes.users, total: userRes.total },
			{ type: SearchFilterType.POST, results: postRes.posts, total: postRes.total },
			{ type: SearchFilterType.EVENT, results: eventRes.events, total: eventRes.total },
			{ type: SearchFilterType.GROUP, results: groupRes.groups, total: groupRes.total },
			{ type: SearchFilterType.HASHTAGS, results: hashtagRes.hashtags, total: hashtagRes.total },
			{ type: SearchFilterType.LOCATION, results: locationRes.users, total: locationRes.total },
		];
		// Calculate pagination (use max total for totalPages)
		const maxTotal = Math.max(
			userRes.total,
			postRes.total,
			eventRes.total,
			groupRes.total,
			hashtagRes.total,
			locationRes.total,
		);
		const totalPages = Math.ceil(maxTotal / limit);
		return {
			data,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		};
	}

	async search(
		query: SearchQueryDto,
		userId: string | undefined,
		i18n: I18nContext,
	): Promise<PaginatedSearchResultDto> {
		const { key, filter, sportType, level, page = 1, limit = 10, timeRange } = query;
		// Save search history if userId and key exist
		if (userId && key) {
			const history = await this.searchHistoryRepository.create(new Types.ObjectId(userId), {
				text: key,
			});
		}
		const data: SearchResultDto[] = [];
		let maxTotal = 0;
		for (const f of filter) {
			switch (f) {
				case SearchFilterType.USER: {
					const res = await this.searchRepository.searchUsers(key, sportType, level, page, limit);
					data.push({ type: SearchFilterType.USER, results: res.users, total: res.total });
					if (res.total > maxTotal) maxTotal = res.total;
					break;
				}
				case SearchFilterType.POST: {
					const res = await this.searchRepository.searchPosts(
						key,
						sportType,
						page,
						limit,
						timeRange,
					);
					data.push({ type: SearchFilterType.POST, results: res.posts, total: res.total });
					if (res.total > maxTotal) maxTotal = res.total;
					break;
				}
				case SearchFilterType.EVENT: {
					const res = await this.searchRepository.searchEvents(
						key,
						sportType,
						page,
						limit,
						timeRange,
					);
					data.push({ type: SearchFilterType.EVENT, results: res.events, total: res.total });
					if (res.total > maxTotal) maxTotal = res.total;
					break;
				}
				case SearchFilterType.GROUP: {
					const res = await this.searchRepository.searchGroups(key, page, limit);
					data.push({ type: SearchFilterType.GROUP, results: res.groups, total: res.total });
					if (res.total > maxTotal) maxTotal = res.total;
					break;
				}
				case SearchFilterType.HASHTAGS: {
					const res = await this.postService.getPostsByHashtag(
						key || '',
						i18n,
						page,
						limit,
						userId,
					);
					data.push({ type: SearchFilterType.HASHTAGS, results: res.posts, total: res.total || 0 });
					if ((res.total || 0) > maxTotal) maxTotal = res.total || 0;
					break;
				}
				case SearchFilterType.LOCATION: {
					const res = await this.searchRepository.searchLocations(key, page, limit);
					data.push({ type: SearchFilterType.LOCATION, results: res.users, total: res.total });
					if (res.total > maxTotal) maxTotal = res.total;
					break;
				}
				default:
					break;
			}
		}
		const totalPages = Math.ceil(maxTotal / limit);
		return {
			data,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		};
	}

	async getSearchHistoryWithBasicData(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ data: any[]; total: number }> {
		const result = await this.searchHistoryRepository.findByUserIdPagination(
			new Types.ObjectId(userId),
			page,
			limit,
		);

		// Collect all unique IDs for batch fetching
		const userIds = new Set<string>();
		const groupIds = new Set<string>();
		const eventIds = new Set<string>();

		result.data.forEach((history: any) => {
			if (history.user) userIds.add(history.user.toString());
			if (history.group) groupIds.add(history.group.toString());
			if (history.event) eventIds.add(history.event.toString());
		});

		// Batch fetch basic data
		const [users, groups, events] = await Promise.all([
			userIds.size > 0 ? this.userService.getBasicInfos(Array.from(userIds)) : [],
			groupIds.size > 0 ? this.groupService.getBasicInfos(Array.from(groupIds)) : [],
			eventIds.size > 0 ? this.eventService.getBasicInfos(Array.from(eventIds)) : [],
		]);

		// Create lookup maps with proper typing
		const userMap = new Map<string, any>();
		const groupMap = new Map<string, any>();
		const eventMap = new Map<string, any>();

		(users as any[]).forEach((user: any) => {
			if (user._id) {
				userMap.set(user._id.toString(), user);
			}
		});

		(groups as any[]).forEach((group: any) => {
			if (group._id) {
				groupMap.set(group._id.toString(), group);
			}
		});

		(events as any[]).forEach((event: any) => {
			if (event._id) {
				eventMap.set(event._id.toString(), event);
			}
		});

		// Enhance search history with basic data
		const enhancedData = result.data.map((history: any) => {
			const enhanced: any = {
				userId: history.userId?.toString?.() || '',
				text: history.text,
				hashtag: history.hashtag,
				createdAt: history.createdAt ? new Date(history.createdAt).toISOString() : '',
			};

			// Add user data if exists
			if (history.user) {
				const user = userMap.get(history.user.toString());
				if (user && user._id && user.firstName !== undefined && user.lastName !== undefined) {
					enhanced.user = {
						id: user._id.toString(),
						name: `${user.firstName} ${user.lastName}`.trim(),
						avatar: user.avatar || null,
					};
				} else {
					enhanced.user = null;
				}
			}

			// Add group data if exists
			if (history.group) {
				const group = groupMap.get(history.group.toString());
				if (group && group._id && group.name) {
					enhanced.group = {
						id: group._id.toString(),
						name: group.name,
						avatar: group.avatar || null,
					};
				} else {
					enhanced.group = null;
				}
			}

			// Add event data if exists
			if (history.event) {
				const event = eventMap.get(history.event.toString());
				if (event && event._id && event.title) {
					enhanced.event = {
						id: event._id.toString(),
						name: event.title,
						avatar: event.image || null,
					};
				} else {
					enhanced.event = null;
				}
			}

			return enhanced;
		});

		// Filter out objects that only contain userId and createdAt (no meaningful data)
		const filteredData = enhancedData.filter(item => {
			// Remove objects that have user, group, or event as null
			if (item.user === null || item.group === null || item.event === null) {
				return false;
			}
			return true;
		});

		return {
			data: filteredData,
			total: result.total,
		};
	}
}
