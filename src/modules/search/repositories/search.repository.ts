import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';

export interface ISearchRepository {
	searchUsers(
		key?: string,
		sportType?: SportType,
		level?: ActivityLevel,
		page?: number,
		limit?: number,
	): Promise<{ users: any[]; total: number }>;

	searchPosts(
		key?: string,
		sportType?: SportType,
		page?: number,
		limit?: number,
		timeRange?: string,
	): Promise<{ posts: any[]; total: number }>;

	searchEvents(
		key?: string,
		sportType?: SportType,
		page?: number,
		limit?: number,
		timeRange?: string,
	): Promise<{ events: any[]; total: number }>;

	searchGroups(
		key?: string,
		page?: number,
		limit?: number,
	): Promise<{ groups: any[]; total: number }>;

	searchHashtags(
		key?: string,
		page?: number,
		limit?: number,
		timeRange?: string,
	): Promise<{ hashtags: any[]; total: number }>;

	searchLocations(
		key?: string,
		page?: number,
		limit?: number,
	): Promise<{ locations: any[]; total: number }>;
}

export const ISearchRepository = Symbol('ISearchRepository');
