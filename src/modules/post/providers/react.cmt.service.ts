import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../repositories/comment.repository';
import { ReactType } from '@common/enum/react.type.enum';
import { IReactCommentRepository } from '../repositories/react.comment.repository';

@Injectable()
export class ReactCmtService {
	constructor(
		private readonly reactRepo: IReactCommentRepository,
		private readonly commentRepo: ICommentRepository,
	) {}

	async reactCmt(userId: string, cmtId: string, type: ReactType) {
		const already = await this.reactRepo.isReacted(userId, cmtId);
		if (already) throw new ConflictException('react.FAILED');
		const existedCmt = await this.commentRepo.findById(cmtId);
		if (!existedCmt) {
			throw new NotFoundException('cmt.NOT_FOUND');
		}
		await this.reactRepo.reactComment(userId, cmtId, type);
		await this.commentRepo.updateReactCount(cmtId, type, 1);

		return { message: 'react.SUCCESS' };
	}

	async updateReact(userId: string, cmtId: string, type: ReactType) {
		const already = await this.reactRepo.isReacted(userId, cmtId);
		if (!already) throw new ConflictException('react.FAILED');
		const existedCmt = await this.commentRepo.findById(cmtId);
		if (!existedCmt) {
			throw new NotFoundException('cmt.NOT_FOUND');
		}
		const reactedCmt = await this.reactRepo.findByUserIdAndCmtId(userId, cmtId);
		if (!reactedCmt) throw new NotFoundException('common.error');
		const oldType = reactedCmt.type;
		await this.reactRepo.updateReact(userId, cmtId, type);
		await this.commentRepo.updateReactCount(cmtId, type, 1);
		await this.commentRepo.updateReactCount(cmtId, oldType, -1);
		return { message: 'react.SUCCESS' };
	}

	async unReactCmt(userId: string, cmtId: string) {
		const result = await this.reactRepo.unReactComment(userId, cmtId);
		if (!result) {
			return { message: 'react.FAILED' };
		}
		const existedCmt = await this.commentRepo.findById(cmtId);
		if (!existedCmt) {
			throw new NotFoundException('cmt.NOT_FOUND');
		}
		const type = result.type;
		await this.commentRepo.updateReactCount(cmtId, type, -1);
		return { message: 'react.SUCCESS' };
	}
}
