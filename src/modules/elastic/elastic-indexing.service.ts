import { Injectable } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticIndexingService {
	private readonly client: Client;

	constructor(private readonly elasticService: ElasticService) {
		this.client = this.elasticService.getClient();
	}

	// --- POST Methods ---
	async indexPost(post: {
		id: string;
		title: string;
		content: string;
		authorId: string;
		authorName: string;
		hashtags?: string[];
		sports?: string[];
	}) {
		await this.client.index({
			index: 'posts',
			id: post.id,
			document: post,
		});
	}

	async updatePost(
		postId: string,
		partialData: Partial<{
			title: string;
			content: string;
			authorName: string;
			hashtags?: string[];
			sports?: string[];
		}>,
	) {
		await this.client.update({
			index: 'posts',
			id: postId,
			doc: partialData,
		});
	}

	async deletePost(postId: string) {
		await this.client.delete({
			index: 'posts',
			id: postId,
		});
	}

	// --- USER Methods ---
	async indexUser(user: { id: string; fullName: string; bio?: string }) {
		await this.client.index({
			index: 'users',
			id: user.id,
			document: user,
		});
	}

	async updateUser(
		userId: string,
		partialData: Partial<{
			fullName: string;
			bio: string;
		}>,
	) {
		await this.client.update({
			index: 'users',
			id: userId,
			doc: {
				id: userId,
				...partialData,
			},
			doc_as_upsert: true,
		});
	}

	// --- EVENT Methods ---
	async indexEvent(event: {
		id: string;
		creatorId: string;
		creatorName: string;
		title: string;
		description?: string;
		hashtags?: string[];
		sports?: string[];
	}) {
		await this.client.index({
			index: 'events',
			id: event.id,
			document: event,
		});
	}

	async updateEvent(
		eventId: string,
		partialData: Partial<{
			title: string;
			description: string;
			creatorName: string;
			hashtags?: string[];
			sports?: string[];
		}>,
	) {
		await this.client.update({
			index: 'events',
			id: eventId,
			doc: partialData,
		});
	}

	async deleteEvent(eventId: string) {
		await this.client.delete({
			index: 'events',
			id: eventId,
		});
	}

	async updateAuthorNameForPostsAndEvents(userId: string, newFullName: string) {
		// Cập nhật tất cả post có authorId = userId
		await this.client.updateByQuery({
			index: 'posts',
			body: {
				script: {
					source: 'ctx._source.authorName = params.name',
					lang: 'painless',
					params: {
						name: newFullName,
					},
				},
				query: {
					term: {
						authorId: userId,
					},
				},
			},
		});

		// Cập nhật tất cả event có creatorId = userId
		await this.client.updateByQuery({
			index: 'events',
			body: {
				script: {
					source: 'ctx._source.creatorName = params.name',
					lang: 'painless',
					params: {
						name: newFullName,
					},
				},
				query: {
					term: {
						creatorId: userId,
					},
				},
			},
		});
	}
}
