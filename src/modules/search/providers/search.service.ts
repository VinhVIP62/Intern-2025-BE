import { Injectable } from '@nestjs/common';
import { ElasticService } from '../../elastic/elastic.service';
import { Client } from '@elastic/elasticsearch';
import { PostService } from '@modules/post/providers/post.service';
import { UserService } from '@modules/user/providers/user.service';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { PostSearchDocument } from '../interfaces/post-search-document.interface';
import { UserSearchDocument } from '../interfaces/user-search-document.interface';

@Injectable()
export class SearchService {
	private readonly client: Client;

	constructor(
		private readonly elasticService: ElasticService,
		private readonly userService: UserService,
		private readonly postService: PostService,
	) {
		this.client = this.elasticService.getClient();
	}

	async indexPost(post: {
		id: string;
		title: string;
		content: string;
		authorId: string;
		authorName: string;
	}) {
		await this.client.index({
			index: 'posts',
			id: post.id,
			document: post,
		});
	}

	async indexUser(user: { id: string; fullName: string; bio?: string }) {
		await this.client.index({
			index: 'users',
			id: user.id,
			document: user,
		});
	}

	async searchPosts(userId: string | null, keyword: string) {
		const result = await this.client.search({
			index: 'posts',
			query: {
				multi_match: {
					query: keyword,
					fields: ['title^2', 'content', 'authorName'],
					fuzziness: 'AUTO',
				},
			},
		});

		return result.hits.hits.map(hit => hit._source);
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
		const [postResultsRaw, userResultsRaw] = result.responses;

		// Kiểm tra lỗi trả về từ Elasticsearch
		if ('error' in postResultsRaw) {
			throw new Error(`Elasticsearch post search error: ${JSON.stringify(postResultsRaw.error)}`);
		}
		if ('error' in userResultsRaw) {
			throw new Error(`Elasticsearch user search error: ${JSON.stringify(userResultsRaw.error)}`);
		}

		// Gán đúng kiểu
		const postResults = postResultsRaw as SearchResponse<PostSearchDocument>;
		const userResults = userResultsRaw as SearchResponse<UserSearchDocument>;

		const postIds = postResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		const userIds = userResults.hits.hits
			.map(hit => hit._source?.id)
			.filter((id): id is string => Boolean(id));

		// Gọi đến các service để lấy thông tin chi tiết
		const [posts, users] = await Promise.all([
			this.postService.findManyByIds(postIds, userId),
			this.userService.findManyByIds(userIds),
		]);

		return { posts, users };
	}
}
