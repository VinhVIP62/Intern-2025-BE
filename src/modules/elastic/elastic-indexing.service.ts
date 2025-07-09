import { Injectable } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticIndexingService {
	private readonly client: Client;

	constructor(private readonly elasticService: ElasticService) {
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

	async updatePost(
		postId: string,
		partialData: Partial<{
			title: string;
			content: string;
			authorName: string;
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
}
