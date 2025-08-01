import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { CreatePostDto } from '../dto/request/create-post.dto';
import { Post, PostDocument } from '../entities/post.schema';
import { UpdatePostDto } from '../dto/request/update-post.dto';
import { PostQueryDto } from '../dto/request/post-query.dto';
import { PaginatedResponseDto } from '@modules/post/dto/response/paginated-response.dto';
import { ICommentRepository } from '../repositories/comment.repository';
import { PostResponseDto } from '../dto/response/post-response.dto';
import { CommentResponseDto } from '../dto/response/comment-response.dto';
import { CreateCommentDto } from '../dto/request/create-comment.dto';
import { Comment } from '../entities/comment.schema';
import { plainToInstance } from 'class-transformer';
import { UploadService } from '@modules/upload/providers/upload.service';
import { ILikePostRepository } from '../repositories/likePost.repository';
import { ILikeCommentRepository } from '../repositories/likeComment.repository';
import { CommentPaginationResponseDto } from '../dto/response/comment.pagination.response.dto';
import { LikePostPaginationDto } from '../dto/response/likePost.pagination.dto';
import { FriendService } from 'src/modules/friend/providers/friend.service';
import { Privacy } from '@modules/post/enum/privacy.enum';
import { FriendStatus } from '@modules/friend/enum/friendStatus.enum';
import { BasePostResponseDto, PostSearchResponseDto } from '../dto/response/post-response.dto';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly commentRepository: ICommentRepository,
		private readonly uploadService: UploadService,
		private readonly likePostRepository: ILikePostRepository,
		private readonly likeCommentRepository: ILikeCommentRepository,
		private readonly friendService: FriendService,
	) {}

	async createPost(post: CreatePostDto): Promise<PostDocument> {
		const newPost = await this.postRepository.create(post);
		return newPost;
	}
	//case share post not contain
	async getPostById(id: string, myUserId: string): Promise<PostResponseDto> {
		const post = await this.postRepository.findById(id);
		if (!post) {
			throw new NotFoundException('Post not found');
		}
		if (post.privacy === Privacy.FRIENDS && post.userId !== myUserId) {
			const isFriend = await this.friendService.isFriend(myUserId, post.userId);
			if (isFriend !== FriendStatus.FRIEND) {
				throw new ForbiddenException('You are not authorized to view this post');
			}
		}
		if (post.privacy === Privacy.PRIVATE && post.userId !== myUserId) {
			throw new ForbiddenException('You are not authorized to view this post');
		}
		return await this.transformResponse(post, myUserId);
	}

	async updatePost(userId: string, postId: string, post: UpdatePostDto): Promise<PostResponseDto> {
		//check to delete image
		const myPost = await this.postRepository.findById(postId);
		if (!myPost) {
			throw new NotFoundException('Post not found');
		}
		//check to delete image
		if (myPost.userId !== userId) {
			throw new ForbiddenException('You are not the author of this post');
		}
		//get image to delete, if url is null -> delete all images
		const imagesToDelete = myPost.images.filter(image => !post.url?.some(e => e === image.url));

		if (imagesToDelete.length > 0) {
			//delete image
			for (const image of imagesToDelete) {
				await this.uploadService.deleteImage(image.publicId);
			}
		}
		//get image to add
		const imagesToAdd = myPost.images.filter(image => post.url?.some(e => e === image.url));
		//upload image
		//add new url
		const postWithNewUrl = {
			...post,
			images: [...imagesToAdd, ...(post.images || [])],
		};

		const updatedPost = await this.postRepository.update(postId, postWithNewUrl);
		if (!updatedPost) {
			throw new NotFoundException('Post not found');
		}
		return await this.transformResponse(updatedPost, userId);
	}
	//delete post -> delete like post
	async deletePost(userId: string, postId: string): Promise<PostDocument | null> {
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundException('Post not found to delete');
		}
		if (post.userId !== userId) {
			throw new ForbiddenException('You are not authorized to delete this post');
		}
		const deletedPost = await this.postRepository.delete(postId);
		post.images.forEach(async image => {
			await this.uploadService.deleteImage(image.publicId);
		});
		await this.likePostRepository.delete(postId);
		await this.commentRepository.deleteAllByPostId(postId);
		return deletedPost;
	}

	async getPostWithPagination(
		query: PostQueryDto,
		myUserId: string,
	): Promise<PaginatedResponseDto> {
		//check if user is friend to get list of friends
		//myUserId is the id of the user to get posts -> for case get my posts, check like post
		//query.userId is the id of the user to get posts
		//if query.userId is not provided, get posts of all public or is friend

		let mongoQuery: any = {};
		//check if query.userId is provided and same as myUserId
		if (query.userId && query.userId === myUserId) {
			//pass value : my-posts
			mongoQuery.userId = myUserId;
			// console.log('myUserId, my post', myUserId);
		}
		//check if query.userId is provided and different from myUserId
		else if (query.userId && query.userId !== myUserId) {
			//pass value : friend-posts
			//call isFriend service
			// console.log('query with userId', query.userId);
			// console.log('myUserId', myUserId);
			const isFriend = await this.friendService.isFriend(myUserId, query.userId);
			console.log('isFriend', isFriend);
			if (isFriend === FriendStatus.FRIEND) {
				mongoQuery = {
					userId: query.userId,
					privacy: { $in: [Privacy.PUBLIC, Privacy.FRIENDS] },
				};
				// console.log('friend-posts');
			} else {
				mongoQuery = {
					userId: query.userId,
					privacy: Privacy.PUBLIC,
				};
				// console.log('public-posts');
			}
		} else {
			const allFriendIds = await this.friendService.fetchAllFriends(myUserId);

			mongoQuery = {
				$or: [
					{ privacy: Privacy.PUBLIC, originalPrivacy: { $in: [Privacy.PUBLIC, null] } },
					{
						privacy: Privacy.FRIENDS,
						userId: { $in: allFriendIds },
						originalPrivacy: { $in: [Privacy.PUBLIC, null] },
					},

					{
						privacy: Privacy.FRIENDS,
						userId: { $in: allFriendIds },
						originalPrivacy: Privacy.FRIENDS,
						originalPostUserId: { $in: allFriendIds },
					},
				],
			};
			// console.log('all-posts');
			// console.log('allFriendIds', allFriendIds);
		}
		//if query.userId is not provided, get posts of all public or is friend
		//pass value : all-posts

		//get all friend ids

		//get posts
		const { posts, total } = await this.postRepository.findAllWithPagination(mongoQuery, query);
		if (total === 0) {
			return {
				paginatedPosts: [],
				pagination: {
					total: 0,
					page: query.page,
					limit: query.limit,
					totalPages: 0,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			};
		}
		//check if page is greater than total pages

		if (query.page && query.page > Math.ceil(total / (query.limit || 10))) {
			throw new BadRequestException(
				`Page is greater than total pages, total page is ${Math.ceil(total / (query.limit || 10))}`,
			);
		}

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
		const existingLike = await this.likePostRepository.findByPostIdAndUserId(postId, userId);
		if (existingLike) {
			throw new BadRequestException('User already liked the post');
		}

		//create like post
		const likedPost = await this.likePostRepository.likePost(postId, userId);
		if (!likedPost) {
			throw new BadRequestException('Failed to like post');
		}
		//update post like count
		const newPost = await this.postRepository.likePost(postId);
		if (!newPost) {
			throw new BadRequestException('Failed to like post');
		}
		return await this.transformResponse(newPost, userId);
	}
	async unlikePost(userId: string, postId: string): Promise<PostResponseDto | null> {
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundException('Post not found to unlike');
		}
		//check user has liked post
		const existingLike = await this.likePostRepository.findByPostIdAndUserId(postId, userId);
		if (!existingLike) {
			throw new BadRequestException('User did not like the post');
		}

		const unlikedPost = await this.likePostRepository.unlikePost(postId, userId);
		if (!unlikedPost) {
			throw new BadRequestException('Failed to unlike post');
		}
		const newPost = await this.postRepository.unlikePost(postId);
		if (!newPost) {
			throw new BadRequestException('Failed to unlike post');
		}
		return await this.transformResponse(newPost, userId);
	}
	async commentPost(
		comment: CreateCommentDto,
		parentCommentId: string | null = null,
		myUserId: string,
	): Promise<CommentResponseDto> {
		const post = await this.postRepository.findById(comment.postId);
		if (!post) {
			throw new NotFoundException('Post not found to comment');
		}
		const newComment = await this.commentRepository.create(comment, parentCommentId);
		return await this.transformCommentResponse(newComment, myUserId);
	}
	async getCommentsByPostId(
		postId: string,
		myUserId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<CommentPaginationResponseDto> {
		if (page && page < 1) {
			throw new BadRequestException('Page must be greater than 0');
		}
		if (limit && (limit < 1 || limit > 10)) {
			throw new BadRequestException('Limit must be greater than 0 and less than 10');
		}
		const { comments, total } = await this.commentRepository.findByPostId(postId, page, limit);

		const transformedComments = await Promise.all(
			comments.map(async comment => this.transformCommentResponse(comment, myUserId)),
		);
		return {
			comments: transformedComments,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / (limit || 10)),
				hasNextPage: (page || 1) < Math.ceil(total / (limit || 10)),
				hasPreviousPage: (page || 1) > 1,
			},
		};
	}
	async getMoreCommentsByRootCommentId(
		postId: string,
		rootCommentId: string,
		page: number,
		limit: number,
		myUserId: string,
	): Promise<CommentPaginationResponseDto> {
		if (page && page < 1) {
			throw new BadRequestException('Page must be greater than 0');
		}
		if (limit && (limit < 1 || limit > 10)) {
			throw new BadRequestException('Limit must be greater than 0 and less than 10');
		}
		const { comments, total } = await this.commentRepository.showMoreComment(
			postId,
			rootCommentId,
			page,
			limit,
		);
		const transformedComments = await Promise.all(
			comments.map(async comment => this.transformCommentResponse(comment, myUserId)),
		);
		return {
			comments: transformedComments,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / (limit || 10)),
				hasNextPage: (page || 1) < Math.ceil(total / (limit || 10)),
				hasPreviousPage: (page || 1) > 1,
			},
		};
	}
	//delete comment -> delete like comment
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
		return await this.transformCommentResponse(deletedComment, userId);
	}

	async transformResponse(post: BasePostResponseDto, myUserId: string): Promise<PostResponseDto> {
		const likePost = await this.likePostRepository.findByPostIdAndUserId(post.postId, myUserId);
		return plainToInstance(
			PostResponseDto,
			{
				...JSON.parse(JSON.stringify(post)),
				postId: post.postId,
				images: post.images.map(image => image.url),
				commentCount: await this.commentRepository.getCommentCountByPostId(post.postId),
				likeCount: post.likeCount || 0,
				userId: post.userId,
				fullName: post.fullName,
				avatar: post.avatar,
				isLiked: likePost ? true : false,
			},
			{
				excludeExtraneousValues: true,
			},
		);
	}
	async transformCommentResponse(
		comment: CommentResponseDto | Comment,
		myUserId: string,
	): Promise<CommentResponseDto> {
		const likeCmt = await this.likeCommentRepository.findByPostIdAndCommentIdAndUserId(
			comment.postId,
			comment._id.toString(),
			myUserId,
		);
		return plainToInstance(
			CommentResponseDto,
			{
				...JSON.parse(JSON.stringify(comment)),
				postId: comment.postId,
				userId: comment.userId,
				userReplied:
					comment.parentCommentId ?
						(await this.commentRepository.findById(comment.parentCommentId))?.userId
					:	null,
				isLiked: likeCmt ? true : false,
				likedUserCount: comment.likeCount || 0,
			},
			{
				excludeExtraneousValues: true,
			},
		);
	}
	async findCommentById(commentId: string): Promise<CommentResponseDto | null> {
		const comment = await this.commentRepository.findById(commentId);
		if (!comment) {
			return null;
		}
		return comment;
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
		if (postId !== comment.postId) {
			throw new BadRequestException('Comment not found in this post to like');
		}
		const existingLike = await this.likeCommentRepository.findByPostIdAndCommentIdAndUserId(
			postId,
			commentId,
			userId,
		);
		if (existingLike) {
			throw new BadRequestException('User already liked the comment');
		}
		const likedComment = await this.likeCommentRepository.likeComment(postId, commentId, userId);
		if (!likedComment) {
			throw new BadRequestException('Failed to like comment');
		}
		const updatedComment = await this.commentRepository.update(commentId, {
			likeCount: (comment.likeCount || 0) + 1,
		});
		if (!updatedComment) {
			throw new BadRequestException('Failed to like comment');
		}
		return await this.transformCommentResponse(updatedComment, userId);
	}
	async unlikeComment(
		userId: string,
		postId: string,
		commentId: string,
	): Promise<CommentResponseDto> {
		const comment = await this.commentRepository.findById(commentId);
		if (!comment) {
			throw new NotFoundException('Comment not found to unlike');
		}
		if (postId !== comment.postId) {
			throw new BadRequestException('Comment not found in this post to unlike');
		}
		const existingLike = await this.likeCommentRepository.findByPostIdAndCommentIdAndUserId(
			postId,
			commentId,
			userId,
		);
		if (!existingLike) {
			throw new BadRequestException('User did not like the comment');
		}

		const unlikedComment = await this.likeCommentRepository.unlikeComment(
			postId,
			commentId,
			userId,
		);
		if (!unlikedComment) {
			throw new BadRequestException('Failed to unlike comment');
		}
		const updatedComment = await this.commentRepository.update(commentId, {
			likeCount: (comment.likeCount || 1) - 1,
		});
		if (!updatedComment) {
			throw new BadRequestException('Failed to unlike comment');
		}
		return await this.transformCommentResponse(updatedComment, userId);
	}
	async getUserLikedPosts(
		postId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<LikePostPaginationDto> {
		if (page && page < 1) {
			throw new BadRequestException('Page must be greater than 0');
		}
		if (limit && (limit < 1 || limit > 10)) {
			throw new BadRequestException('Limit must be greater than 0 and less than 10');
		}
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundException('Post not found to get liked users');
		}

		const { users, pagination } = await this.likePostRepository.getUserLikedPosts(
			postId,
			page,
			limit,
		);
		if (pagination.total === 0) {
			return {
				users: [],
				pagination: {
					total: 0,
					page,
					limit,
				},
			};
		}
		if (page && page > Math.ceil(pagination.total / (limit || 10))) {
			throw new BadRequestException(
				`Page is greater than total pages, total page is ${Math.ceil(pagination.total / (limit || 10))}`,
			);
		}
		return { users, pagination };
	}

	async sharePost(postId: string, post: CreatePostDto): Promise<PostDocument> {
		const sharedPost = await this.postRepository.sharePost(postId, post);
		if (!sharedPost) {
			throw new BadRequestException('Failed to share post');
		}
		return sharedPost;
	}
	async searchPost(query: any, userId: string) {
		const searchResult = await this.postRepository.search(query);
		//check if post is public, private, friends
		const postWithPrivacy = await Promise.all(
			searchResult.posts.map(async post => {
				if (post.privacy === Privacy.PUBLIC) {
					return post;
				} else if (post.privacy === Privacy.FRIENDS) {
					const isFriend = await this.friendService.isFriend(userId, post.userId);
					if (isFriend === FriendStatus.FRIEND) {
						return post;
					}
					return null;
				} else return null;
			}),
		);
		// console.log('postWithPrivacy', postWithPrivacy);
		return postWithPrivacy.filter(post => post !== null) as PostSearchResponseDto[];
	}
}
