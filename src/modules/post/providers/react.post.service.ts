import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IReactRepository } from '../repositories/react.repository';
import { IPostRepository } from '../repositories/post.repository';
import { ReactType } from '@common/enum/react.type.enum';

@Injectable()
export class ReactService {
	constructor(
		private readonly reactRepo: IReactRepository,
		private readonly postRepo: IPostRepository,
	) {}

	async reactPost(userId: string, postId: string, type: ReactType) {
		const already = await this.reactRepo.isReacted(userId, postId);
		if (already) throw new ConflictException('react.FAILED');
		const existedPost = await this.postRepo.findById(postId);
		if (!existedPost) {
			throw new NotFoundException('post.NOT_FOUND');
		}
		await this.reactRepo.reactPost(userId, postId, type);
		await this.postRepo.updateReactCount(postId, type, 1);

		return { message: 'react.SUCCESS' };
	}

	async updateReact(userId: string, postId: string, type: ReactType) {
		const already = await this.reactRepo.isReacted(userId, postId);
		if (!already) throw new ConflictException('react.FAILED');
		const existedPost = await this.postRepo.findById(postId);
		if (!existedPost) {
			throw new NotFoundException('post.NOT_FOUND');
		}
		const reactedPost = await this.reactRepo.findByUserIdAndPostId(userId, postId);
		if (!reactedPost) throw new NotFoundException('common.error');
		const oldType = reactedPost.type;
		await this.reactRepo.updateReact(userId, postId, type);
		await this.postRepo.updateReactCount(postId, type, 1);
		await this.postRepo.updateReactCount(postId, oldType, -1);
		return { message: 'react.SUCCESS' };
	}

	async unReactPost(userId: string, postId: string) {
		const result = await this.reactRepo.unReactPost(userId, postId);
		if (!result) {
			return { message: 'react.FAILED' };
		}
		const existedPost = await this.postRepo.findById(postId);
		if (!existedPost) {
			throw new NotFoundException('post.NOT_FOUND');
		}
		const type = result.type;
		await this.postRepo.updateReactCount(postId, type, -1);
		return { message: 'react.SUCCESS' };
	}

	async isReacted(userId: string, postId: string) {
		return this.reactRepo.findByUserIdAndPostId(userId, postId);
	}
}
