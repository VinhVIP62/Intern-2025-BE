import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import {
	SearchAllQueryDto,
	SearchQueryDto,
	PaginatedSearchResultDto,
	SearchFilterType,
	SearchResultDto,
} from '../dto/search.dto';
import { ISearchRepository } from '../repositories/search.repository';
import { PostService } from '@modules/post/providers/post.service';

@Injectable()
export class SearchService {
	constructor(
		@Inject(ISearchRepository)
		private readonly searchRepository: ISearchRepository,
		@Inject(forwardRef(() => PostService))
		private readonly postService: PostService,
	) {}

	async searchAll(
		query: SearchAllQueryDto,
		userId: string | undefined,
		i18n: I18nContext,
	): Promise<PaginatedSearchResultDto> {
		const { key, page = 1, limit = 10, timeRange } = query;
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
			{ type: SearchFilterType.LOCATION, results: locationRes.locations, total: locationRes.total },
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
					data.push({ type: SearchFilterType.HASHTAGS, results: res.posts, total: res.total });
					if (res.total > maxTotal) maxTotal = res.total;
					break;
				}
				case SearchFilterType.LOCATION: {
					const res = await this.searchRepository.searchLocations(key, page, limit);
					data.push({ type: SearchFilterType.LOCATION, results: res.locations, total: res.total });
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
}
