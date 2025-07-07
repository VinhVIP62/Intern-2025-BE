import { Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { FileHostService } from '@shared/modules';

import { SocialPost } from '../entities';
import { IPostRepository, IPostRepositoryToken } from '../repositories';

@Injectable()
export class PostService {
	constructor(
		@Inject(IPostRepositoryToken) private readonly postRepository: IPostRepository,
		private readonly fileHostService: FileHostService,
	) {}

	async createPost(data: Partial<SocialPost> & { files?: MemoryStoredFile[] }) {
		if (data.files)
			data.fileUrls =
				(await Promise.all(data.files.map(f => this.fileHostService.file2Url(f)))) || null;
		const createdPost = this.postRepository.create(data);
		return createdPost;
	}

	async updatePost(
		id: string,
		userId: string,
		data: Partial<SocialPost> & { files?: MemoryStoredFile[] },
	) {
		if (data.files)
			data.fileUrls =
				(await Promise.all(data.files.map(f => this.fileHostService.file2Url(f)))) || null;
		const createdPost = this.postRepository.findOneByAndUpdate({ id, userId }, data);
		return createdPost;
	}

	async deletePost(id: string, userId: string) {
		const deletedPost = this.postRepository.findOneByAndSoftDelete({ id, userId }, userId);
		return deletedPost;
	}

	async getPost(id: string, userId: string) {
		const foundPost = await this.postRepository.fetchPost(id, userId);
		return foundPost;
	}

	// async getFeeds() {}
}
