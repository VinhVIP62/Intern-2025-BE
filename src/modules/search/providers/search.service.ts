import { Injectable } from '@nestjs/common';
import { ElasticService } from '../../elastic/elastic.service';
import { Client } from '@elastic/elasticsearch';
import { PostService } from '@modules/post/providers/post.service';
import { UserService } from '@modules/user/providers/user.service';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { PostSearchDocument } from '../interfaces/post-search-document.interface';
import { UserSearchDocument } from '../interfaces/user-search-document.interface';
import { EventSearchDocument } from '../interfaces/event-search-document.interface';
import { EventService } from '@modules/event/providers/event.service';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';

@Injectable()
export class SearchService {
	private readonly client: Client;

	constructor(
		private readonly elasticService: ElasticService,
		private readonly userService: UserService,
		private readonly postService: PostService,
		private readonly eventService: EventService,
		private readonly friendRepository: IFriendRepository,
	) {
		this.client = this.elasticService.getClient();
	}

	async searchPosts(userId: string | null, keyword: string) {
		const postResultsRaw = await this.client.search({
			index: 'posts',
			query: {
				bool: {
					should: [
						{
							multi_match: {
								query: keyword,
								fields: ['title^2', 'content', 'authorName'],
								fuzziness: 'AUTO',
							},
						},
						{
							term: {
								'sports.keyword': {
									value: keyword,
									boost: 3,
								},
							},
						},
					],
				},
			},
		});

		if ('error' in postResultsRaw) {
			throw new Error(`Elasticsearch post search error: ${JSON.stringify(postResultsRaw.error)}`);
		}

		const postResults = postResultsRaw as SearchResponse<PostSearchDocument>;

		const postIds = postResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		const [posts] = await Promise.all([this.postService.findManyByIds(postIds, userId)]);

		return posts;
	}

	async searchUsers(userId: string | null, keyword: string) {
		const userResultsRaw = await this.client.search({
			index: 'users',
			query: {
				multi_match: {
					query: keyword,
					fields: ['fullName', 'bio'],
					fuzziness: 'AUTO',
				},
			},
		});

		if ('error' in userResultsRaw) {
			throw new Error(`Elasticsearch user search error: ${JSON.stringify(userResultsRaw.error)}`);
		}

		const userResults = userResultsRaw as SearchResponse<UserSearchDocument>;

		const userIds = userResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		const [users] = await Promise.all([this.userService.findManyByIds(userIds)]);

		return users;
	}

	async searchEvents(userId: string | null, keyword: string) {
		const eventResultsRaw = await this.client.search({
			index: 'events',
			query: {
				bool: {
					should: [
						{
							multi_match: {
								query: keyword,
								fields: ['title^2', 'description', 'creatorName'],
								fuzziness: 'AUTO',
							},
						},
						{
							term: {
								'sports.keyword': {
									value: keyword,
									boost: 3,
								},
							},
						},
					],
				},
			},
		});

		if ('error' in eventResultsRaw) {
			throw new Error(`Elasticsearch event search error: ${JSON.stringify(eventResultsRaw.error)}`);
		}

		const eventResults = eventResultsRaw as SearchResponse<EventSearchDocument>;

		const eventIds = eventResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		const [events] = await Promise.all([this.eventService.findManyByIds(eventIds, userId)]);

		return events;
	}

	async searchAll(userId: string | null, keyword: string) {
		const result = await this.client.msearch({
			searches: [
				{
					index: 'posts',
				},
				{
					query: {
						multi_match: {
							query: keyword,
							fields: ['title^2', 'content', 'authorName'],
							fuzziness: 'AUTO',
						},
					},
				},
				{
					index: 'events',
				},
				{
					query: {
						bool: {
							should: [
								{
									multi_match: {
										query: keyword,
										fields: ['title^2', 'description', 'creatorName'],
										fuzziness: 'AUTO',
									},
								},
								{
									term: {
										'sports.keyword': {
											value: keyword,
											boost: 3,
										},
									},
								},
							],
						},
					},
				},
				{
					index: 'users',
				},
				{
					query: {
						multi_match: {
							query: keyword,
							fields: ['fullName', 'bio'],
							fuzziness: 'AUTO',
						},
					},
				},
			],
		});

		// msearch trả về mảng responses[]
		const [postResultsRaw, eventResultsRaw, userResultsRaw] = result.responses;

		// Kiểm tra lỗi trả về từ Elasticsearch
		if ('error' in postResultsRaw) {
			throw new Error(`Elasticsearch post search error: ${JSON.stringify(postResultsRaw.error)}`);
		}
		if ('error' in eventResultsRaw) {
			throw new Error(`Elasticsearch event search error: ${JSON.stringify(eventResultsRaw.error)}`);
		}
		if ('error' in userResultsRaw) {
			throw new Error(`Elasticsearch user search error: ${JSON.stringify(userResultsRaw.error)}`);
		}

		// Gán đúng kiểu
		const postResults = postResultsRaw as SearchResponse<PostSearchDocument>;
		const eventResults = eventResultsRaw as SearchResponse<EventSearchDocument>;
		const userResults = userResultsRaw as SearchResponse<UserSearchDocument>;

		const postIds = postResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		const eventIds = eventResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		const userIds = userResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		// Gọi đến các service để lấy thông tin chi tiết
		const [posts, events, users] = await Promise.all([
			this.postService.findManyByIds(postIds, userId),
			this.eventService.findManyByIds(eventIds, userId),
			this.userService.findManyByIds(userIds),
		]);

		return { posts, events, users };
	}

	async searchFriends(userId: string | null, keyword: string) {
		const userResultsRaw = await this.client.search({
			index: 'users',
			query: {
				multi_match: {
					query: keyword,
					fields: ['fullName', 'bio'],
					fuzziness: 'AUTO',
				},
			},
		});

		if ('error' in userResultsRaw) {
			throw new Error(`Elasticsearch user search error: ${JSON.stringify(userResultsRaw.error)}`);
		}

		const userResults = userResultsRaw as SearchResponse<UserSearchDocument>;

		let userIds = userResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		// Nếu đã đăng nhập thì lọc chỉ lấy bạn bè
		if (userId) {
			userIds = await this.friendRepository.filterFriendIds(userId, userIds);
		}

		const users = await this.userService.findManyByIds(userIds);

		return users;
	}

	async searchPostsByHashtag(userId: string | null, hashtag: string) {
		const result = await this.client.search({
			index: 'posts',
			query: {
				term: {
					'hashtags.keyword': hashtag.toLowerCase(),
				},
			},
		});
		const hits = result.hits.hits as SearchResponse<PostSearchDocument>['hits']['hits'];
		const postIds = hits.map(hit => hit._source?.id).filter((id): id is string => Boolean(id));
		return this.postService.findManyByIds(postIds, userId);
	}

	async searchEventsByHashtag(userId: string | null, hashtag: string) {
		const result = await this.client.search({
			index: 'events',
			query: {
				term: {
					'hashtags.keyword': hashtag.toLowerCase(),
				},
			},
		});
		const hits = result.hits.hits as SearchResponse<EventSearchDocument>['hits']['hits'];
		const eventIds = hits.map(hit => hit._source?.id).filter((id): id is string => Boolean(id));
		return this.eventService.findManyByIds(eventIds, userId);
	}
}
