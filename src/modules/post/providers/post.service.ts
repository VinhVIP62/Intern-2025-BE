import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../repositories/post.repository';
import { Post } from '../entities/post.schema';
import { I18nContext } from 'nestjs-i18n';
import { PaginatedPostsResponseDto, PostResponseDto } from '../dto/post.dto';

@Injectable()
export class PostService {
	constructor(private readonly postRepository: IPostRepository) {}

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
}
