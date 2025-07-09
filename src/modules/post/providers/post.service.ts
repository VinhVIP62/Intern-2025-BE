import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { Post } from '../entities/post.schema';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryDto } from '../dto/post-query.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ICommentRepository } from '../repositories/comment.repository';
import { PostResponseDto } from '../dto/post-response.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.schema';
import { plainToInstance } from 'class-transformer';
import { UploadService } from 'src/shared/upload/providers/upload.service';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly commentRepository: ICommentRepository,
		private readonly uploadService: UploadService,
	) {}

	async createPost(post: CreatePostDto): Promise<PostResponseDto> {
		const newPost = await this.postRepository.create(post);
		return await this.transformResponse(newPost, newPost.userId);
	}
	async getPostById(id: string, myUserId: string): Promise<PostResponseDto> {
		const post = await this.postRepository.findById(id);
		if (!post) {
			throw new NotFoundException('Post not found');
		}
		return await this.transformResponse(post, myUserId);
	}

	async updatePost(userId: string, postId: string, post: UpdatePostDto): Promise<PostResponseDto> {
		const oldPost = await this.postRepository.findById(postId);
		if (!oldPost) {
			throw new NotFoundException('Post not found to update');
		}
		if (oldPost.userId !== userId) {
			throw new ForbiddenException('You are not authorized to update this post');
		}
		const updatedPost = await this.postRepository.update(postId, post);
		if (!updatedPost) {
			throw new NotFoundException('Post not found to update');
		}
		return await this.transformResponse(updatedPost, userId);
	}
	async deletePost(userId: string, postId: string): Promise<Post | null> {
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundException('Post not found to delete');
		}
		if (post.userId !== userId) {
			throw new ForbiddenException('You are not authorized to delete this post');
		}
		const deletedPost = await this.postRepository.delete(postId);
		post.imagesIds?.forEach(async imageId => {
			try {
				await this.uploadService.deleteImage(imageId);
			} catch (error) {
				console.log('error in delete image from cloudinary');
				console.log(error);
				for (let i = 0; i < 3; i++) {
					try {
						await this.uploadService.deleteImage(imageId);
						break;
					} catch (error) {
						console.log('error in delete image from cloudinary');
						console.log(error);
					}
				}
			}
		});
		return deletedPost;
	}

	async getPostWithPagination(
		query: PostQueryDto,
		myUserId: string,
	): Promise<PaginatedResponseDto> {
		const { posts, total } = await this.postRepository.findAllWithPagination(query);
		return {
			paginatedPosts: await Promise.all(
				posts.map(async post => this.transformResponse(post, myUserId)),
			),
			pagination: {
				total,
				page: query.page,
				limit: query.limit,
				totalPages: Math.ceil(total / (query.limit || 10)),
				hasNextPage: (query.page || 1) < Math.ceil(total / (query.limit || 10)),
				hasPreviousPage: (query.page || 1) > 1,
			},
		};
	}
	async getMyPosts(userId: string, query: PostQueryDto): Promise<PaginatedResponseDto> {
		return await this.getPostWithPagination({ ...query, userId }, userId);
	}
	async likePost(userId: string, postId: string): Promise<PostResponseDto | null> {
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundException('Post not found to like');
		}
		//check user has liked post
		if (post.likedUserIds?.includes(userId)) {
			throw new BadRequestException('User already liked the post');
		}
		const likedPost = await this.postRepository.likePost(userId, postId);
		if (!likedPost) {
			throw new BadRequestException('Failed to like post');
		}
		return await this.transformResponse(likedPost, userId);
	}
	async unlikePost(userId: string, postId: string): Promise<PostResponseDto | null> {
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundException('Post not found to unlike');
		}
		//check user has liked post
		if (!post.likedUserIds?.includes(userId)) {
			throw new BadRequestException('User did not like the post');
		}
		const unlikedPost = await this.postRepository.unlikePost(userId, post);
		if (!unlikedPost) {
			throw new BadRequestException('Failed to unlike post');
		}
		return await this.transformResponse(unlikedPost, userId);
	}
	async commentPost(
		comment: CreateCommentDto,
		parentCommentId: string | null = null,
	): Promise<CommentResponseDto> {
		const post = await this.postRepository.findById(comment.postId);
		if (!post) {
			throw new NotFoundException('Post not found to comment');
		}
		const newComment = await this.commentRepository.create(comment, parentCommentId);
		return plainToInstance(CommentResponseDto, JSON.parse(JSON.stringify(newComment)), {
			excludeExtraneousValues: true,
		});
	}
	async getCommentsByPostId(postId: string): Promise<CommentResponseDto[]> {
		const comments = await this.commentRepository.findByPostId(postId);
		return comments.map(comment =>
			plainToInstance(CommentResponseDto, comment, {
				excludeExtraneousValues: true,
			}),
		);
	}
	async getMoreCommentsByRootCommentId(
		postId: string,
		rootCommentId: string,
	): Promise<CommentResponseDto[]> {
		const comments = await this.commentRepository.showMoreComment(postId, rootCommentId);
		return comments.map(comment =>
			plainToInstance(CommentResponseDto, JSON.parse(JSON.stringify(comment)), {
				excludeExtraneousValues: true,
			}),
		);
	}

	async deleteComment(
		userId: string,
		postId: string,
		commentId: string,
	): Promise<CommentResponseDto> {
		const comment = await this.commentRepository.findById(commentId);
		if (!comment) {
			throw new NotFoundException('Comment not found to delete');
		}
		if (comment.userId !== userId) {
			throw new ForbiddenException('You are not authorized to delete this comment');
		}
		if (comment.postId !== postId) {
			throw new BadRequestException('Comment not found in this post to delete');
		}
		const deletedComment = await this.commentRepository.delete(userId, postId, commentId);
		return plainToInstance(CommentResponseDto, JSON.parse(JSON.stringify(deletedComment)), {
			excludeExtraneousValues: true,
		});
	}
	async transformResponse(post: Post, myUserId: string): Promise<PostResponseDto> {
		return plainToInstance(
			PostResponseDto,
			{
				...JSON.parse(JSON.stringify(post)),
				postId: post._id.toString(),

				commentCount: await this.commentRepository.getCommentCountByPostId(post._id.toString()),
				likedUserCount: post.likedUserIds?.length || 0,

				isLiked: post.likedUserIds?.includes(myUserId) || false,
			},
			{
				excludeExtraneousValues: true,
			},
		);
	}

	async likeComment(
		userId: string,
		postId: string,
		commentId: string,
	): Promise<CommentResponseDto> {
		const comment = await this.commentRepository.findById(commentId);
		if (!comment) {
			throw new NotFoundException('Comment not found to like');
		}
		const updatedComment = await this.commentRepository.update(commentId, {
			likedUserIds: [...(comment.likedUserIds || []), userId],
		});
		if (!updatedComment) {
			throw new BadRequestException('Failed to like comment');
		}
		return plainToInstance(CommentResponseDto, JSON.parse(JSON.stringify(updatedComment)), {
			excludeExtraneousValues: true,
		});
	}

	async searchPost(query: any): Promise<Post[]> {
		return await this.postRepository.search(query);
	}
}
