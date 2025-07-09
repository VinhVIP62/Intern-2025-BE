import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentResponseDto } from '../dto/response-comment.dto';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { ICommentRepository } from '../repositories/comment.repository';
import { EntityNotFound } from '@common/exceptions';
import { IPostRepository } from '@modules/post/repositories/post.repository';
import { ILikeRepository } from '../repositories/like.repository';
import { TargetType } from '@common/enum/target-type.enum';

@Injectable()
export class CommentService {
	constructor(
		private readonly commentRepository: ICommentRepository,
		private readonly postRepository: IPostRepository,
		private readonly likeRepository: ILikeRepository,
	) {}

	async createComment(userId: string, dto: CreateCommentDto): Promise<CommentResponseDto> {
		const post = await this.postRepository.findById(dto.postId);
		if (!post) throw new EntityNotFound('exception.post.notFound');

		if (dto.parentCommentId) {
			const parentComment = await this.commentRepository.findById(dto.parentCommentId);
			if (!parentComment) throw new EntityNotFound('exception.comment.parentNotFound');
		}

		const created = await this.commentRepository.create({
			postId: new Types.ObjectId(dto.postId),
			parentCommentId: dto.parentCommentId ? new Types.ObjectId(dto.parentCommentId) : null,
			content: dto.content,
			author: new Types.ObjectId(userId),
		});

		if (dto.parentCommentId) {
			await this.commentRepository.updateCommentCount(dto.parentCommentId, 1);
		}

		await this.postRepository.updateCommentCount(dto.postId, 1);

		return plainToInstance(CommentResponseDto, created, {
			excludeExtraneousValues: true,
		});
	}

	async getCommentsByPost(
		postId: string,
		userId: string | null,
		query: { parentCommentId?: string; page?: string; limit?: string },
	): Promise<{
		items: CommentResponseDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const parentCommentId = query.parentCommentId || null;
		const page = parseInt(query.page || '1', 10);
		const limit = parseInt(query.limit || '10', 10);

		const { data, total } = await this.commentRepository.findByPostIdWithPagination({
			postId,
			parentCommentId,
			page,
			limit,
		});

		let likedCommentIds: string[] = [];
		if (userId) {
			const commentIds = data.map(comment => comment._id.toString());
			likedCommentIds = await this.likeRepository.findIsLiked(
				userId,
				commentIds,
				TargetType.Comment,
			);
		}

		const items = data.map(comment => {
			const plain = plainToInstance(CommentResponseDto, comment, {
				excludeExtraneousValues: true,
			});
			plain.isLiked = likedCommentIds.includes(comment._id.toString());
			return plain;
		});

		return {
			items,
			meta: { total, page, limit },
		};
	}
}
