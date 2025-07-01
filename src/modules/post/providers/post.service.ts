import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { Post } from '../entities/post.schema';
import { I18nContext } from 'nestjs-i18n';
import { PaginatedPostsResponseDto, PostResponseDto, CreatePostDto } from '../dto/post.dto';
import { FileService } from '../../file/providers/file.service';
import { PostType } from '../entities/post.enum';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly fileService: FileService,
	) {}

	async getNewsfeed(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		sport?: string,
	): Promise<PaginatedPostsResponseDto> {
		const { posts, total } = await this.postRepository.findApprovedPosts(page, limit, sport);

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

	async getPostById(postId: string, i18n: I18nContext): Promise<PostResponseDto> {
		try {
			const post = await this.postRepository.findById(postId);
			return post as PostResponseDto;
		} catch (error) {
			throw new NotFoundException(i18n.t('post.POST_NOT_FOUND'));
		}
	}

	async getPostsByUserId(
		userId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedPostsResponseDto> {
		const { posts, total } = await this.postRepository.findByUserId(userId, page, limit);

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
	): Promise<PaginatedPostsResponseDto> {
		const { posts, total } = await this.postRepository.findAll(page, limit, sport, userId);

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
		const hashtags = this.extractHashtags(createPostDto.content);

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
			hashtags: this.createHashtagsMap(hashtags),
		};

		const post = await this.postRepository.create(postData, authorId, images, video);

		return post as PostResponseDto;
	}

	private validatePostContent(
		createPostDto: CreatePostDto,
		files: Express.Multer.File[],
		i18n: I18nContext,
	): void {
		// Validate content length
		if (!createPostDto.content || createPostDto.content.trim().length === 0) {
			throw new BadRequestException(i18n.t('post.CONTENT_REQUIRED'));
		}

		// Validate post type and media
		switch (createPostDto.type) {
			case PostType.TEXT:
				if (files.length > 0) {
					throw new BadRequestException(i18n.t('post.TEXT_POST_NO_MEDIA'));
				}
				break;
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

	private extractHashtags(content: string): string[] {
		const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
		const hashtags = content.match(hashtagRegex) || [];
		return hashtags.map(tag => tag.toLowerCase());
	}

	private createHashtagsMap(hashtags: string[]): Map<string, number> {
		const hashtagsMap = new Map<string, number>();
		hashtags.forEach(tag => {
			hashtagsMap.set(tag, (hashtagsMap.get(tag) || 0) + 1);
		});
		return hashtagsMap;
	}

	private isVideoFile(filename: string): boolean {
		const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
		const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
		return videoExtensions.includes(extension);
	}
}
