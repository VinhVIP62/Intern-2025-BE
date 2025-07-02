import { Injectable, ConflictException } from '@nestjs/common';
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

		await this.reactRepo.reactPost(userId, postId, type);
		await this.postRepo.updateReactCount(postId, type, 1);

		return { message: 'react.SUCCESS' };
	}

	async unReactPost(userId: string, postId: string) {
		const result = await this.reactRepo.unReactPost(userId, postId);
		if (!result) {
			return { message: 'react.FAILED' };
		}
		const type = result.type;
		await this.postRepo.updateReactCount(postId, type, -1);
		return { message: 'react.SUCCESS' };
	}
}
