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
import { FileService } from '@modules/file/providers/file.service';
import { AppLoggerService } from '@common/logger/logger.service';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationType } from '@modules/notification/type/notification-type.enum';
import { SocketEventService } from '@modules/realtime/socket-event.service';
import { UserService } from '@modules/user/providers/user.service';
import { mapMimeTypeToType } from '@common/utils/media.util';

@Injectable()
export class CommentService {
	constructor(
		private readonly commentRepository: ICommentRepository,
		private readonly postRepository: IPostRepository,
		private readonly likeRepository: ILikeRepository,
		private readonly userService: UserService,
		private readonly fileService: FileService,
		private readonly logger: AppLoggerService,
		private readonly notificationService: NotificationService,
		private readonly socketEventService: SocketEventService,
	) {}

	async createComment(userId: string, dto: CreateCommentDto): Promise<CommentResponseDto> {
		const post = await this.postRepository.findById(dto.postId);
		if (!post) throw new EntityNotFound('exception.post.notFound');

		let parentCommentAuthorId: string | null = null;

		if (dto.parentCommentId) {
			const parentComment = await this.commentRepository.findById(dto.parentCommentId);
			if (!parentComment) throw new EntityNotFound('exception.comment.parentNotFound');
			parentCommentAuthorId = parentComment.author._id.toString();
		}

		const taggedUserIds = dto.taggedFriends?.map(id => new Types.ObjectId(id)) || [];
		const mentionedUserIds = dto.mentionedFriends?.map(id => new Types.ObjectId(id)) || [];

		const processedMedia = (dto.media ?? []).map(item => ({
			url: item.url,
			mimeType: item.mimeType,
			type: mapMimeTypeToType(item.mimeType),
		}));

		const created = await this.commentRepository.create({
			postId: new Types.ObjectId(dto.postId),
			parentCommentId: dto.parentCommentId ? new Types.ObjectId(dto.parentCommentId) : null,
			content: dto.content,
			author: new Types.ObjectId(userId),
			media: processedMedia,
			taggedFriends: taggedUserIds,
			mentionedFriends: mentionedUserIds,
		});

		if (dto.parentCommentId) {
			await this.commentRepository.updateCommentCount(dto.parentCommentId, 1);
		}
		await this.postRepository.updateCommentCount(dto.postId, 1);

		// Gửi thông báo
		const notifiedUserIds = new Set<string>();

		// 1. Chủ bài viết
		// const postOwnerId = post.author._id.toString();
		// if (postOwnerId !== userId) {
		// 	await this.notificationService.create({
		// 		actor: userId,
		// 		receiver: postOwnerId,
		// 		type: NotificationType.Comment,
		// 		title: 'Ai đó đã bình luận bài viết của bạn',
		// 		content: dto.content,
		// 		metaRef: dto.postId,
		// 		metaModel: 'Post',
		// 	});
		// 	notifiedUserIds.add(postOwnerId);
		// }

		// 2. Tác giả bình luận cha (nếu là reply)
		if (
			parentCommentAuthorId &&
			parentCommentAuthorId !== userId &&
			!notifiedUserIds.has(parentCommentAuthorId)
		) {
			await this.notificationService.create({
				actor: userId,
				receiver: parentCommentAuthorId,
				type: NotificationType.Comment,
				title: 'Ai đó đã phản hồi bình luận của bạn',
				content: dto.content,
				metaRef: dto.postId,
				metaModel: 'Post',
			});

			const actor = await this.userService.findById(userId);
			if (actor) {
				this.socketEventService.sendNotification(parentCommentAuthorId, {
					actor: {
						_id: actor._id.toString(),
						fullName: actor.fullName,
						avatarUrl: actor.avatarUrl,
					},
					type: NotificationType.Comment,
					title: 'Ai đó đã phản hồi bình luận của bạn',
					content: dto.content,
					metaRef: dto.postId,
					metaModel: 'Post',
					isRead: false,
					createdAt: new Date().toISOString(),
				});
			}

			notifiedUserIds.add(parentCommentAuthorId);
		}

		// 3. Những người được tag
		for (const tagged of taggedUserIds) {
			const taggedId = tagged.toString();
			// if (taggedId !== userId && !notifiedUserIds.has(taggedId)) {
			if (taggedId !== userId) {
				await this.notificationService.create({
					actor: userId,
					receiver: taggedId,
					type: NotificationType.Tag,
					title: 'Bạn đã được gắn thẻ trong một bình luận',
					content: dto.content,
					metaRef: dto.postId,
					metaModel: 'Post',
				});

				const actor = await this.userService.findById(userId);
				if (actor) {
					this.socketEventService.sendNotification(taggedId, {
						actor: {
							_id: actor._id.toString(),
							fullName: actor.fullName,
							avatarUrl: actor.avatarUrl,
						},
						type: NotificationType.Tag,
						title: 'Bạn đã được gắn thẻ trong một bình luận',
						content: dto.content,
						metaRef: dto.postId,
						metaModel: 'Post',
						isRead: false,
						createdAt: new Date().toISOString(),
					});
				}

				notifiedUserIds.add(taggedId);
			}
		}

		// 4. Những người được mention
		for (const mentioned of mentionedUserIds) {
			const mentionedId = mentioned.toString();
			// if (mentionedId !== userId && !notifiedUserIds.has(mentionedId)) {
			if (mentionedId !== userId) {
				await this.notificationService.create({
					actor: userId,
					receiver: mentionedId,
					type: NotificationType.Mention,
					title: 'Bạn đã được nhắc đến trong một bình luận',
					content: dto.content,
					metaRef: dto.postId,
					metaModel: 'Post',
				});

				const actor = await this.userService.findById(userId);
				if (actor) {
					this.socketEventService.sendNotification(mentionedId, {
						actor: {
							_id: actor._id.toString(),
							fullName: actor.fullName,
							avatarUrl: actor.avatarUrl,
						},
						type: NotificationType.Mention,
						title: 'Bạn đã được nhắc đến trong một bình luận',
						content: dto.content,
						metaRef: dto.postId,
						metaModel: 'Post',
						isRead: false,
						createdAt: new Date().toISOString(),
					});
				}

				notifiedUserIds.add(mentionedId);
			}
		}

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

	async deleteCommentsByPostId(postId: string): Promise<void> {
		const comments = await this.commentRepository.findAllByPostId(postId);
		const commentIds = comments.map(c => c._id.toString());

		if (commentIds.length > 0) {
			// 1. Xoá tất cả media trong các comment
			const mediaPaths = comments
				.flatMap(comment => comment.media || [])
				.map(media => this.fileService.extractFilePathFromPublicUrl(media.url));

			for (const path of mediaPaths) {
				try {
					await this.fileService.deleteFile(path);
				} catch (err) {
					this.logger.warn(
						`Không thể xoá media: ${path} - ${err instanceof Error ? err.message : String(err)}`,
						CommentService.name,
					);
				}
			}

			//  2. Xoá like của các comment
			await this.likeRepository.deleteManyByTargetIds(commentIds, TargetType.Comment);

			// 3. Xoá comment khỏi DB
			await this.commentRepository.deleteManyByIds(commentIds);
		}
	}

	async revokeComment(userId: string, commentId: string): Promise<CommentResponseDto> {
		const revoked = await this.commentRepository.revokeComment(commentId, userId);
		if (!revoked) {
			throw new EntityNotFound('Comment not found or not authorized');
		}

		return plainToInstance(CommentResponseDto, revoked, {
			excludeExtraneousValues: true,
		});
	}
}
