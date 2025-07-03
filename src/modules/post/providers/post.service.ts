import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { Post } from '../entities/post.schema';
import { I18nContext } from 'nestjs-i18n';
import {
	PaginatedPostsResponseDto,
	PostResponseDto,
	CreatePostDto,
	UpdatePostDto,
	TrendingHashtagsResponseDto,
} from '../dto/post.dto';
import { FileService } from '../../file/providers/file.service';
import { PostAccessLevel, PostType } from '../entities/post.enum';
import { NotificationService } from '../../notification/providers/notification.service';
import { NotificationType, ReferenceModel } from '../../notification/entities/notification.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/entities/user.schema';
import { UserService } from '../../user/providers/user.service';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly fileService: FileService,
		private readonly notificationService: NotificationService,
		@InjectModel('User') private readonly userModel: Model<User>,
		private readonly userService: UserService,
	) {}

	async getNewsfeed(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		userId: string,
		sport?: string,
	): Promise<PaginatedPostsResponseDto> {
		let accessLevels = [PostAccessLevel.PUBLIC, PostAccessLevel.PROTECTED, PostAccessLevel.PRIVATE];
		const { posts, total } = await this.postRepository.findNewsfeedByAccessLevels(
			page,
			limit,
			userId,
			accessLevels,
			sport,
		);

		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			posts: posts as PostResponseDto[],
			total,
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPrevPage,
		};
	}

	async getPostById(
		postId: string,
		i18n: I18nContext,
		currentUserId?: string,
	): Promise<PostResponseDto> {
		try {
			const post = await this.postRepository.findById(postId);
			if (!post) {
				throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
			}
			if (post.accessLevel === PostAccessLevel.PUBLIC) {
				return post as PostResponseDto;
			}
			if (
				currentUserId &&
				(await this.userService.isFriend(currentUserId, post.author.toString()))
			) {
				return post as PostResponseDto;
			}
			throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
		} catch (error) {
			throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
		}
	}

	async getPostsByUserId(
		userId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		currentUserId?: string,
	): Promise<PaginatedPostsResponseDto> {
		let accessLevels = [PostAccessLevel.PUBLIC];
		console.log(currentUserId, userId);
		if (currentUserId && (await this.userService.isFriend(currentUserId, userId))) {
			accessLevels = [PostAccessLevel.PUBLIC, PostAccessLevel.PROTECTED];
		}
		const { posts, total } = await this.postRepository.findByUserIdAndAccessLevels(
			userId,
			page,
			limit,
			accessLevels,
		);

		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			posts: posts as PostResponseDto[],
			total,
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPrevPage,
		};
	}

	async getAllPosts(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		sport?: string,
		userId?: string,
		currentUserId?: string,
	): Promise<PaginatedPostsResponseDto> {
		// protected level can not working because @Public() decorator cannot call jwtstrategy -> not generate req.user.id
		let accessLevels = [PostAccessLevel.PUBLIC];
		if (userId && currentUserId && (await this.userService.isFriend(currentUserId, userId))) {
			accessLevels = [PostAccessLevel.PUBLIC, PostAccessLevel.PROTECTED];
		}
		const { posts, total } = await this.postRepository.findAllByAccessLevels(
			page,
			limit,
			sport,
			userId,
			accessLevels,
		);

		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			posts: posts as PostResponseDto[],
			total,
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPrevPage,
		};
	}

	async createPost(
		createPostDto: CreatePostDto,
		authorId: string,
		files: Express.Multer.File[] = [],
		i18n: I18nContext,
	): Promise<PostResponseDto> {
		// Validate content based on post type
		this.validatePostContent(createPostDto, files, i18n);

		// Extract hashtags from content
		let hashtags: string[] = [];
		if (createPostDto.content) {
			hashtags = this.extractHashtags(createPostDto.content);
		}

		// Upload media files
		const images: string[] = [];
		let video: string | undefined;

		if (files && files.length > 0) {
			const uploadResults = await this.fileService.uploadFiles(files);

			for (const result of uploadResults) {
				if (this.isVideoFile(result.original_filename || '')) {
					if (video) {
						throw new BadRequestException(i18n.t('post.ONLY_ONE_VIDEO_ALLOWED'));
					}
					video = result.secure_url;
				} else {
					images.push(result.secure_url);
				}
			}
		}

		// Create post with hashtags
		const postData = {
			...createPostDto,
			hashtags: hashtags,
		};

		const post = await this.postRepository.create(postData, authorId, images, video);

		return post as PostResponseDto;
	}

	async updatePost(
		postId: string,
		updatePostDto: UpdatePostDto,
		userId: string,
		files: Express.Multer.File[] = [],
		i18n: I18nContext,
	): Promise<PostResponseDto> {
		// Check ownership
		const isOwner = await this.postRepository.checkOwnership(postId, userId);
		if (!isOwner) {
			throw new ForbiddenException(i18n.t('post.UNAUTHORIZED_TO_MODIFY'));
		}

		// Validate content if provided
		if (updatePostDto.content) {
			this.validateUpdateContent(updatePostDto, files, i18n);
		}

		// Upload new media files if provided
		const images: string[] = updatePostDto.oldUrls || [];
		let video: string | undefined;

		if (files && files.length > 0) {
			const uploadResults = await this.fileService.uploadFiles(files);

			for (const result of uploadResults) {
				if (this.isVideoFile(result.original_filename || '')) {
					if (video) {
						throw new BadRequestException(i18n.t('post.ONLY_ONE_VIDEO_ALLOWED'));
					}
					video = result.secure_url;
				} else {
					images.push(result.secure_url);
				}
			}
		}

		// Extract hashtags if content is updated
		let updateData: any = { ...updatePostDto };
		if (updatePostDto.content !== undefined && updatePostDto.content !== null) {
			const hashtags = this.extractHashtags(updatePostDto.content);
			updateData.hashtags = hashtags;
		}

		try {
			const post = await this.postRepository.update(postId, updateData, images, video);
			return post as PostResponseDto;
		} catch (error) {
			if (error.message === 'Post not found') {
				throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
			}
			throw error;
		}
	}

	async deletePost(postId: string, userId: string, i18n: I18nContext): Promise<void> {
		// Check ownership
		const isOwner = await this.postRepository.checkOwnership(postId, userId);
		if (!isOwner) {
			throw new ForbiddenException(i18n.t('post.UNAUTHORIZED_TO_DELETE'));
		}

		try {
			await this.postRepository.delete(postId);
		} catch (error) {
			if (error.message === 'Post not found') {
				throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
			}
			throw error;
		}
	}

	private validatePostContent(
		createPostDto: CreatePostDto,
		files: Express.Multer.File[],
		i18n: I18nContext,
	): void {
		// Validate post type and media
		switch (createPostDto.type) {
			case PostType.IMAGE:
				if (files.length === 0) {
					throw new BadRequestException(i18n.t('post.IMAGE_POST_REQUIRES_IMAGES'));
				}
				const hasImages = files.some(file => !this.isVideoFile(file.originalname));
				if (!hasImages) {
					throw new BadRequestException(i18n.t('post.IMAGE_POST_REQUIRES_IMAGES'));
				}
				break;
			case PostType.VIDEO:
				if (files.length === 0) {
					throw new BadRequestException(i18n.t('post.VIDEO_POST_REQUIRES_VIDEO'));
				}
				const hasVideo = files.some(file => this.isVideoFile(file.originalname));
				if (!hasVideo) {
					throw new BadRequestException(i18n.t('post.VIDEO_POST_REQUIRES_VIDEO'));
				}
				break;
			case PostType.EVENT:
				if (!createPostDto.eventId) {
					throw new BadRequestException(i18n.t('post.EVENT_POST_REQUIRES_EVENT_ID'));
				}
				break;
		}

		// Validate file count
		if (files.length > 10) {
			throw new BadRequestException(i18n.t('post.TOO_MANY_FILES'));
		}
	}

	private validateUpdateContent(
		updatePostDto: UpdatePostDto,
		files: Express.Multer.File[],
		i18n: I18nContext,
	): void {
		// Validate content length
		if (updatePostDto.content && updatePostDto.content.trim().length === 0) {
			throw new BadRequestException(i18n.t('post.CONTENT_REQUIRED'));
		}

		// Validate file count
		if (files.length > 10) {
			throw new BadRequestException(i18n.t('post.TOO_MANY_FILES'));
		}
	}

	private extractHashtags(content?: string): string[] {
		if (!content) return [];
		const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
		const hashtags = content.match(hashtagRegex) || [];
		return hashtags.map(tag => tag.toLowerCase());
	}

	private isVideoFile(filename: string): boolean {
		const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
		const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
		return videoExtensions.includes(extension);
	}

	async getTrendingHashtags(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		timeRange?: string,
	): Promise<TrendingHashtagsResponseDto> {
		const { hashtags, total } = await this.postRepository.findTrendingHashtags(
			page,
			limit,
			timeRange,
		);

		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			hashtags,
			total,
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPrevPage,
		};
	}

	async getPostsByHashtag(
		hashtag: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		currentUserId?: string,
	): Promise<PaginatedPostsResponseDto> {
		// Validate hashtag format
		if (!hashtag.startsWith('#')) {
			hashtag = `#${hashtag}`;
		}

		let accessLevels = [PostAccessLevel.PUBLIC];

		const { posts, total } = await this.postRepository.findPostsByHashtag(
			hashtag,
			page,
			limit,
			accessLevels,
		);

		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			posts: posts as PostResponseDto[],
			total,
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPrevPage,
		};
	}

	async replaceTaggedFriends(
		postId: string,
		userId: string,
		friendIds: string[],
		i18n: I18nContext,
	): Promise<PostResponseDto> {
		const isOwner = await this.postRepository.checkOwnership(postId, userId);
		if (!isOwner) {
			throw new ForbiddenException(i18n.t('post.UNAUTHORIZED_TO_MODIFY'));
		}

		// Lấy danh sách taggedUsers cũ để chỉ gửi notification cho user mới
		const postBefore = await this.postRepository.findById(postId);
		const oldTagged = (postBefore.taggedUsers || []).map(id => id.toString());

		const post = await this.postRepository.replaceTaggedUsers(postId, friendIds);

		// Gửi notification cho các user mới được tag
		const newTagged = friendIds.filter(id => !oldTagged.includes(id) && id !== userId);
		await Promise.all(
			newTagged.map(friendId =>
				this.notificationService.createNotification({
					recipient: friendId,
					sender: userId,
					type: NotificationType.MENTION,
					title: 'You have been tagged in a post',
					message: 'You have been tagged in a post',
					referenceId: postId,
					referenceModel: ReferenceModel.POST,
				}),
			),
		);

		return post as PostResponseDto;
	}

	async likePost(postId: string, userId: string, i18n: I18nContext): Promise<PostResponseDto> {
		try {
			const post = await this.postRepository.likePost(postId, userId);
			return post as PostResponseDto;
		} catch (error) {
			if (error.message === 'Already liked or post not found') {
				throw new BadRequestException(i18n.t('post.ALREADY_LIKED'));
			}
			if (error.message === 'Post not found') {
				throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
			}
			throw error;
		}
	}

	async unlikePost(postId: string, userId: string, i18n: I18nContext): Promise<PostResponseDto> {
		try {
			const post = await this.postRepository.unlikePost(postId, userId);
			return post as PostResponseDto;
		} catch (error) {
			if (error.message === 'Not liked or post not found') {
				throw new BadRequestException(i18n.t('post.NOT_LIKED'));
			}
			if (error.message === 'Post not found') {
				throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
			}
			throw error;
		}
	}

	async getPostLikesWithUserInfo(
		postId: string,
		i18n: I18nContext,
	): Promise<{ likes: { userId: string; fullName: string; avatar: string }[]; likeCount: number }> {
		try {
			const { likes, likeCount } = await this.postRepository.getPostLikes(postId);
			if (!likes.length) return { likes: [], likeCount };
			const users = await this.userModel
				.find({ _id: { $in: likes } })
				.select('avatar firstName lastName _id')
				.lean();
			const likeUsers = users.map(u => ({
				userId: u._id.toString(),
				fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
				avatar: u.avatar,
			}));
			return { likes: likeUsers, likeCount };
		} catch (error) {
			if (error.message === 'Post not found') {
				throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
			}
			throw error;
		}
	}

	async getTrendingPosts(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		sport?: string,
		userId?: string,
		currentUserId?: string,
		timeRange?: string,
	): Promise<PaginatedPostsResponseDto> {
		let accessLevels = [PostAccessLevel.PUBLIC];
		if (userId && currentUserId && (await this.userService.isFriend(currentUserId, userId))) {
			accessLevels = [PostAccessLevel.PUBLIC, PostAccessLevel.PROTECTED];
		}
		const { posts, total } = await this.postRepository.findTrendingPosts(
			page,
			limit,
			sport,
			userId,
			accessLevels,
			timeRange,
		);

		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			posts: posts as PostResponseDto[],
			total,
			page,
			limit,
			totalPages,
			hasNextPage,
			hasPrevPage,
		};
	}
}
