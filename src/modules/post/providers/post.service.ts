import { Injectable } from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from '../dto/response-posts.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { Types } from 'mongoose';
import { EntityNotFound, Forbidden } from '@common/exceptions';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FileService } from '@modules/file/providers/file.service';
import { AppLoggerService } from '@common/logger/logger.service';
import { PostVisibility } from '@common/enum/post-visibility.enum';
import { UserService } from '@modules/user/providers/user.service';
import { ILikeRepository } from '../repositories/like.repository';
import { TargetType } from '@common/enum/target-type.enum';
import { ElasticIndexingService } from '@modules/elastic/elastic-indexing.service';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { ICommentRepository } from '../repositories/comment.repository';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly fileService: FileService,
		private readonly logger: AppLoggerService,
		private readonly elasticIndexingService: ElasticIndexingService,
		private readonly userService: UserService,
		private readonly likeRepository: ILikeRepository,
		private readonly commentRepository: ICommentRepository,
		private readonly friendRepository: IFriendRepository,
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

		const items = data.map(post => {
			const plain = plainToInstance(PostResponseDto, post, {
				excludeExtraneousValues: true,
			});
			plain.isLiked = likedPostIds.includes(post._id.toString());
			return plain;
		});

		return {
			items,
			meta: { total, page, limit },
		};
	}

	async findManyByIds(postIds: string[], viewerId: string | null): Promise<PostResponseDto[]> {
		if (postIds.length === 0) return [];

		// Lấy danh sách bài viết theo ID (chỉ lấy những bài user được quyền xem)
		const objectIds = postIds.map(id => new Types.ObjectId(id));
		const posts = await this.postRepository.findManyByIds(objectIds, viewerId);

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
		const post = await this.postRepository.findById(postId);
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
		const newPost = await this.postRepository.create({
			author,
			...dto,
		});

		try {
			const populatedAuthor = await this.userService.findById(author.toString());

			if (!populatedAuthor) {
				this.logger.warn(`Không tìm thấy User với ID: ${author.toString()}`, PostService.name);
			} else {
				await this.elasticIndexingService.indexPost({
					id: newPost._id.toString(),
					title: newPost.title,
					content: newPost.content,
					authorId: newPost.author._id.toString(),
					authorName: populatedAuthor.fullName,
				});
			}
		} catch (err) {
			this.logger.warn(
				`Không thể thêm Post và ElasticSearch - ${err instanceof Error ? err.message : String(err)}`,
				PostService.name,
			);
		}

		return plainToInstance(PostResponseDto, newPost, {
			excludeExtraneousValues: true,
		});
	}

	async updatePost(postId: string, userId: string, dto: UpdatePostDto): Promise<PostResponseDto> {
		const post = await this.postRepository.findById(postId);
		if (!post) throw new EntityNotFound('exception.post.notFound');

		if (post.author._id.toString() !== userId) {
			throw new Forbidden('exception.post.forbidden');
		}

		if (dto.imageUrls) {
			const oldImageUrls = post.imageUrls || [];
			const newImageUrls = dto.imageUrls;

			const deletedImages = oldImageUrls.filter(url => !newImageUrls.includes(url));

			await Promise.all(
				deletedImages.map(async url => {
					try {
						const path = this.fileService.extractFilePathFromPublicUrl(url);
						await this.fileService.deleteFile(path);
					} catch (err) {
						this.logger.warn(
							`Không thể xoá ảnh: ${url} - ${err instanceof Error ? err.message : String(err)}`,
							PostService.name,
						);
					}
				}),
			);
		}

		const updated = await this.postRepository.updateById(postId, dto);

		return plainToInstance(PostResponseDto, updated, {
			excludeExtraneousValues: true,
		});
	}

	async deletePost(postId: string, userId: string): Promise<void> {
		const post = await this.postRepository.findById(postId);
		if (!post) throw new EntityNotFound('exception.post.notFound');

		if (post.author._id.toString() !== userId) {
			throw new Forbidden('exception.post.forbidden');
		}

		// Xoá ảnh trong imageUrls nếu có
		if (post.imageUrls && post.imageUrls.length > 0) {
			await Promise.all(
				post.imageUrls.map(async url => {
					try {
						const path = this.fileService.extractFilePathFromPublicUrl(url);
						await this.fileService.deleteFile(path);
					} catch (err) {
						this.logger.warn(
							`Không thể xoá ảnh: ${url} - ${err instanceof Error ? err.message : String(err)}`,
							PostService.name,
						);
					}
				}),
			);
		}

		//  Lấy tất cả comment của post
		const comments = await this.commentRepository.findAllByPostId(postId);
		const commentIds = comments.map(c => c._id.toString());

		if (commentIds.length > 0) {
			// Xoá like của các comment
			await this.likeRepository.deleteManyByTargetIds(commentIds, TargetType.Comment);

			//  Xoá comment
			await this.commentRepository.deleteManyByIds(commentIds);
		}

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
