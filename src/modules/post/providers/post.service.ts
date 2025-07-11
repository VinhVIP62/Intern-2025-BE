import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';

import { WithPopulated } from '@common/crud/entities';
import { Action } from '@common/enums';
import { CursorPaginationOption, CustomRequestCtx } from '@common/types/data';

import { CaslFilterFactory, FileHostService } from '@shared/modules';

import { SocialPost } from '../entities';
import { IPostRepository, IPostRepositoryToken } from '../repositories';

@Injectable()
export class PostService {
	constructor(
		@Inject(IPostRepositoryToken) private readonly postRepository: IPostRepository,
		private readonly fileHostService: FileHostService,
		private readonly caslFilterFactory: CaslFilterFactory,
	) {}

	async checkAccessTo(id: string, action: Action): Promise<void> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, action);
		await this.postRepository.findOneByOrFail({ id, ...filter }).catch(() => {
			throw new ForbiddenException();
		});
	}

	async createPost(
		data: Partial<SocialPost> & { files?: MemoryStoredFile[] },
	): Promise<WithPopulated<SocialPost>> {
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const createdPost = this.postRepository.create(data);
		return createdPost;
	}

	async updatePost(
		id: string,
		data: Partial<SocialPost> & { files?: MemoryStoredFile[] },
	): Promise<WithPopulated<SocialPost> | null> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.UPDATE);
		if (data.files) data.fileUrls = await this.fileHostService.files2Urls(data.files);
		const createdPost = this.postRepository.findOneByAndUpdate({ id, ...filter }, data);
		return createdPost;
	}

	async deletePost(id: string): Promise<WithPopulated<SocialPost>> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.DELETE);
		const deletedPost = this.postRepository.findOneByAndSoftDelete(
			{ id, ...filter },
			CustomRequestCtx.getAuthenticated().req.user.id,
		);
		return deletedPost;
	}

	async getPost(id: string): Promise<WithPopulated<SocialPost> | null> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.READ);
		const foundPost = await this.postRepository.findOneBy({ id, ...filter });
		return foundPost;
	}

	async getFeeds(
		userId: string,
		options?: CursorPaginationOption<string>,
	): Promise<{
		foundPosts: WithPopulated<SocialPost>[];
		nextCursor: string;
	}> {
		const filter = this.caslFilterFactory.createFilterForUser(SocialPost, Action.READ);
		const foundPosts = await this.postRepository.fetchFeed(filter, options);
		const nextCursor = foundPosts.at(-1)?.id || '';
		return { foundPosts, nextCursor };
	}
}
