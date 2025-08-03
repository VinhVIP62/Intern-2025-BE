import { Injectable } from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from '../dto/response-posts.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { Types } from 'mongoose';
import { EntityNotFound, Forbidden } from '@common/exceptions';
// import { UpdatePostDto } from '../dto/update-post.dto';
import { FileService } from '@modules/file/providers/file.service';
import { AppLoggerService } from '@common/logger/logger.service';
import { PostVisibility } from '@common/enum/post-visibility.enum';
import { UserService } from '@modules/user/providers/user.service';
import { ILikeRepository } from '../repositories/like.repository';
import { TargetType } from '@common/enum/target-type.enum';
import { ElasticIndexingService } from '@modules/elastic/elastic-indexing.service';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { CommentService } from './comment.service';
import { extractHashtags } from '@common/utils/hashtag.util';
import { PostDocument, PostDocumentWithRestricted } from '../entities/post.schema';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationType } from '@modules/notification/type/notification-type.enum';
import { SocketEventService } from '@modules/realtime/socket-event.service';
import { BlockService } from '@modules/block/providers/block.service';
import { mapMimeTypeToType } from '@common/utils/media.util';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly fileService: FileService,
		private readonly logger: AppLoggerService,
		private readonly elasticIndexingService: ElasticIndexingService,
		private readonly userService: UserService,
		private readonly likeRepository: ILikeRepository,
		private readonly commentService: CommentService,
		private readonly friendRepository: IFriendRepository,
		private readonly notificationService: NotificationService,
		private readonly socketEventService: SocketEventService,
		private readonly blockService: BlockService,
	) {}

	async getPostsWithFilter(
		viewerId: string | null,
		query: {
			userId?: string;
			page?: string;
			limit?: string;
		},
	): Promise<{ items: PostResponseDto[]; meta: { total: number; page: number; limit: number } }> {
		const page = parseInt(query.page || '1', 10);
		const limit = parseInt(query.limit || '10', 10);
		const userId = query.userId;

		let friendIds: string[] = [];
		if (viewerId) {
			const friendObjectIds = await this.friendRepository.findAllByUserId(viewerId);
			friendIds = friendObjectIds.map(id => id.toString());
		}

		const { data, total } = await this.postRepository.findPostsWithPagination({
			userId,
			viewerId,
			page,
			limit,
			friendIds,
		});

		let likedPostIds: string[] = [];
		if (viewerId) {
			const postIds = data.map(post => post._id.toString());
			likedPostIds = await this.likeRepository.findIsLiked(viewerId, postIds, TargetType.Post);
		}

		const items = (data as PostDocumentWithRestricted[]).map(post => {
			const plain = plainToInstance(PostResponseDto, post, {
				excludeExtraneousValues: true,
			});
			plain.isLiked = likedPostIds.includes(post._id.toString());

			if (post.sharedPostIsRestricted) {
				plain.sharedPostIsRestricted = true;
			}

			return plain;
		});

		return {
			items,
			meta: { total, page, limit },
		};
	}

	async getFeedPostsWithFilter(
		viewerId: string | null,
		query: {
			page?: string;
			limit?: string;
		},
	): Promise<{
		items: {
			sharePost: PostResponseDto | null;
			sharedPostIsRestricted: boolean;
			posts: PostResponseDto[];
		}[];
		meta: { total: number; page: number; limit: number };
	}> {
		const page = parseInt(query.page || '1', 10);
		const limit = parseInt(query.limit || '10', 10);
		// const userId = query.userId;

		let blockedUserIds: string[] = [];

		if (viewerId) {
			const blockObjects = await this.blockService.getBlockedUsers(viewerId, 'post');
			blockedUserIds = blockObjects.map(p => p.blocked._id);
		}

		let friendIds: string[] = [];
		if (viewerId) {
			const friendObjectIds = await this.friendRepository.findAllByUserId(viewerId);
			friendIds = friendObjectIds.map(id => id.toString());
		}

		const { data, total } = await this.postRepository.getFeedPosts(
			viewerId,
			friendIds,
			blockedUserIds,
			page,
			limit,
		);

		const allPostIds: string[] = [];
		for (const group of data) {
			group.posts.forEach(post => allPostIds.push(post._id.toString()));
			if (group.sharedPost) {
				allPostIds.push(group.sharedPost._id.toString());
			}
		}

		// 2. Lấy danh sách bài viết user đã like
		let likedPostIds: string[] = [];
		if (viewerId) {
			likedPostIds = await this.likeRepository.findIsLiked(viewerId, allPostIds, TargetType.Post);
		}

		// 3. Convert về DTO và thêm isLiked
		const result = data.map(group => {
			const sharePost =
				group.sharedPost ?
					(() => {
						const plain = plainToInstance(PostResponseDto, group.sharedPost, {
							excludeExtraneousValues: true,
						});
						plain.isLiked = likedPostIds.includes(group.sharedPost._id.toString());
						return plain;
					})()
				:	null;

			const posts = group.posts.map(post => {
				const plain = plainToInstance(PostResponseDto, post, {
					excludeExtraneousValues: true,
				});
				plain.isLiked = likedPostIds.includes(post._id.toString());
				return plain;
			});

			return { sharePost, sharedPostIsRestricted: group.sharedPostIsRestricted, posts };
		});

		return {
			items: result,
			meta: { total, page, limit },
		};
	}

	async findManyByIds(postIds: string[], viewerId: string | null): Promise<PostResponseDto[]> {
		if (postIds.length === 0) return [];

		let blockedUserIds: string[] = [];

		if (viewerId) {
			const blockObjects = await this.blockService.getBlockedUsers(viewerId, 'post');
			blockedUserIds = blockObjects.map(p => p.blocked._id);
		}

		let friendIds: string[] = [];
		if (viewerId) {
			const friendObjectIds = await this.friendRepository.findAllByUserId(viewerId);
			friendIds = friendObjectIds.map(id => id.toString());
		}

		// Lấy danh sách bài viết theo ID (chỉ lấy những bài user được quyền xem)
		const objectIds = postIds.map(id => new Types.ObjectId(id));
		const posts = (await this.postRepository.findManyByIds(
			objectIds,
			viewerId,
			friendIds,
			blockedUserIds,
		)) as PostDocumentWithRestricted[];

		// Nếu có viewer thì lấy danh sách bài viết đã like
		let likedPostIds: string[] = [];
		if (viewerId) {
			likedPostIds = await this.likeRepository.findIsLiked(
				viewerId,
				posts.map(p => p._id.toString()),
				TargetType.Post,
			);
		}

		// Chuyển thành DTO + gán isLiked
		return posts.map(post => {
			const dto = plainToInstance(PostResponseDto, post, { excludeExtraneousValues: true });
			dto.isLiked = viewerId ? likedPostIds.includes(post._id.toString()) : false;
			return dto;
		});
	}

	async getPostById(postId: string, userId: string | null): Promise<PostResponseDto> {
		let friendIds: string[] = [];
		if (userId) {
			const friendObjectIds = await this.friendRepository.findAllByUserId(userId);
			friendIds = friendObjectIds.map(id => id.toString());
		}

		const post = (await this.postRepository.findDetailById(
			postId,
			userId,
			friendIds,
		)) as PostDocumentWithRestricted;
		if (!post) throw new EntityNotFound('exception.post.notFound');

		const isAuthor = post.author._id.toString() === userId;

		// Nếu không phải tác giả thì kiểm tra quyền truy cập
		if (!isAuthor) {
			if (post.visibility === PostVisibility.Private) {
				throw new Forbidden('exception.post.forbidden');
			}

			if (post.visibility === PostVisibility.Friends) {
				// const isFriend = await this.friendService.isFriend(userId, post.author._id.toString());
				// if (!isFriend) {
				// 	throw new Forbidden('exception.post.forbidden');
				// }
				throw new Forbidden('exception.post.forbidden');
			}
		}

		const plain = plainToInstance(PostResponseDto, post, {
			excludeExtraneousValues: true,
		});

		if (post.sharedPostIsRestricted) {
			plain.sharedPostIsRestricted = true;
		}

		// Nếu có userId thì kiểm tra đã like hay chưa
		if (userId) {
			const likedPostIds = await this.likeRepository.findIsLiked(userId, [postId], TargetType.Post);
			plain.isLiked = likedPostIds.includes(postId);
		} else {
			plain.isLiked = false;
		}

		return plain;
	}

	async createPost(author: Types.ObjectId, dto: CreatePostDto): Promise<PostResponseDto> {
		const hashtags = extractHashtags(dto.title + ' ' + dto.content);

		let sharedPost: PostDocument | null = null;
		if (dto.sharedPost) {
			sharedPost = await this.postRepository.findById(dto.sharedPost);
			if (!sharedPost) throw new EntityNotFound('exception.post.notFound');

			// Optional: Kiểm tra quyền xem bài gốc nếu muốn
			if (sharedPost.visibility === PostVisibility.Private) {
				throw new Forbidden('exception.post.forbidden');
			}
		}

		const taggedFriendIds = dto.taggedFriends?.map(id => new Types.ObjectId(id)) || [];

		const processedMedia = (dto.media ?? []).map(item => ({
			url: item.url,
			mimeType: item.mimeType,
			type: mapMimeTypeToType(item.mimeType),
		}));

		const newPost = await this.postRepository.create({
			author,
			title: dto.title,
			content: dto.content,
			media: processedMedia,
			visibility: dto.visibility,
			taggedFriends: taggedFriendIds,
			hashtags,
			sharedPost: sharedPost ? new Types.ObjectId(sharedPost._id) : null,
			sports: dto.sports?.map(id => new Types.ObjectId(id)) ?? [],
			location: dto.location,
		});

		//  Gửi thông báo cho những người được gắn thẻ
		for (const friendId of taggedFriendIds) {
			if (friendId.toString() !== author.toString()) {
				await this.notificationService.create({
					actor: author.toString(),
					receiver: friendId.toString(),
					type: NotificationType.Tag,
					title: 'Bạn đã được gắn thẻ trong một bài viết',
					content: dto.title || '',
					metaRef: newPost._id.toString(),
					metaModel: 'Post',
				});

				const actor = await this.userService.findById(author.toString());

				if (!actor) {
					throw new EntityNotFound('exception.user.notFound');
				}

				this.socketEventService.sendNotification(friendId.toString(), {
					actor: {
						_id: actor._id.toString(),
						fullName: actor.fullName,
						avatarUrl: actor.avatarUrl,
					},
					type: NotificationType.Tag,
					title: 'Bạn đã được gắn thẻ trong một bài viết',
					content: dto.title || '',
					metaRef: newPost._id.toString(),
					metaModel: 'Post',
					isRead: false,
					createdAt: new Date().toISOString(),
				});
			}
		}

		const plain = plainToInstance(PostResponseDto, newPost, {
			excludeExtraneousValues: true,
		});

		try {
			const populatedAuthor = await this.userService.findById(author.toString());

			if (!populatedAuthor) {
				this.logger.warn(`Không tìm thấy User với ID: ${author.toString()}`, PostService.name);
			} else {
				await this.elasticIndexingService.indexPost({
					id: plain._id,
					title: plain.title,
					content: plain.content,
					authorId: plain.author._id,
					authorName: populatedAuthor.fullName,
					hashtags: plain.hashtags,
					sports: plain.sports?.map(p => p.name) ?? [],
				});
			}
		} catch (err) {
			this.logger.warn(
				`Không thể thêm Post và ElasticSearch - ${err instanceof Error ? err.message : String(err)}`,
				PostService.name,
			);
		}

		return plain;
	}

	// async updatePost(postId: string, userId: string, dto: UpdatePostDto): Promise<PostResponseDto> {
	// 	const post = await this.postRepository.findById(postId);
	// 	if (!post) throw new EntityNotFound('exception.post.notFound');

	// 	if (post.author._id.toString() !== userId) {
	// 		throw new Forbidden('exception.post.forbidden');
	// 	}

	// 	if (dto.imageUrls) {
	// 		const oldImageUrls = post.imageUrls || [];
	// 		const newImageUrls = dto.imageUrls;

	// 		const deletedImages = oldImageUrls.filter(url => !newImageUrls.includes(url));

	// 		await Promise.all(
	// 			deletedImages.map(async url => {
	// 				try {
	// 					const path = this.fileService.extractFilePathFromPublicUrl(url);
	// 					await this.fileService.deleteFile(path);
	// 				} catch (err) {
	// 					this.logger.warn(
	// 						`Không thể xoá ảnh: ${url} - ${err instanceof Error ? err.message : String(err)}`,
	// 						PostService.name,
	// 					);
	// 				}
	// 			}),
	// 		);
	// 	}

	// 	const updated = await this.postRepository.updateById(postId, dto);

	// 	return plainToInstance(PostResponseDto, updated, {
	// 		excludeExtraneousValues: true,
	// 	});
	// }

	async deletePost(postId: string, userId: string): Promise<void> {
		const post = await this.postRepository.findById(postId);
		if (!post) throw new EntityNotFound('exception.post.notFound');

		if (post.author._id.toString() !== userId) {
			throw new Forbidden('exception.post.forbidden');
		}

		// Xoá ảnh trong imageUrls nếu có
		if (post.media && post.media.length > 0) {
			await Promise.all(
				post.media.map(async p => {
					try {
						const path = this.fileService.extractFilePathFromPublicUrl(p.url);
						await this.fileService.deleteFile(path);
					} catch (err) {
						this.logger.warn(
							`Không thể xoá ảnh: ${p.url} - ${err instanceof Error ? err.message : String(err)}`,
							PostService.name,
						);
					}
				}),
			);
		}

		//  Lấy tất cả comment của post
		await this.commentService.deleteCommentsByPostId(postId);

		// 5. Xoá like của post
		await this.likeRepository.deleteManyByTargetIds([postId], TargetType.Post);

		// Xoá bài viết
		await this.postRepository.deleteById(postId);

		//  Xoá bài viết khỏi Elasticsearch
		try {
			await this.elasticIndexingService.deletePost(postId);
		} catch (err) {
			this.logger.warn(
				`Không thể xoá post ${postId} khỏi Elasticsearch: ${err instanceof Error ? err.message : String(err)}`,
				PostService.name,
			);
		}
	}
}
