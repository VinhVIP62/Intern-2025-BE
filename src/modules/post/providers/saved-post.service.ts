import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ISavedPostListRepository } from '../repositories/saved-post-list.repository';
import { ResponseSavedPostListDto } from '../dto/response-saved-post-list.dto';
import { Types } from 'mongoose';
import { ISavedPostItemRepository } from '../repositories/saved-post-item.repository';
import { EntityNotFound, Forbidden } from '@common/exceptions';
import { PostResponseDto } from '../dto/response-posts.dto';
import { PostService } from './post.service';

@Injectable()
export class SavedPostService {
	constructor(
		private readonly savedPostListRepo: ISavedPostListRepository,
		private readonly savedPostItemRepo: ISavedPostItemRepository,
		private readonly postService: PostService,
	) {}

	async createSavedPostList(userId: string, name: string): Promise<ResponseSavedPostListDto> {
		const existed = await this.savedPostListRepo.findByUserAndName(userId, name);
		if (existed) {
			throw new ConflictException('Tên danh sách đã tồn tại');
		}

		const created = await this.savedPostListRepo.create({
			userId: new Types.ObjectId(userId),
			name,
		});

		return plainToInstance(ResponseSavedPostListDto, created, {
			excludeExtraneousValues: true,
		});
	}

	async getSavedPostLists(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{
		items: ResponseSavedPostListDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const { data: lists, total } = await this.savedPostListRepo.findAllByUserIdWithPagination(
			userId,
			page,
			limit,
		);

		const listIds = lists.map(l => l._id.toString());

		const mediaUrlMap = await this.savedPostItemRepo.findFirstMediaUrlByListIds(listIds);

		const items = lists.map(list =>
			plainToInstance(
				ResponseSavedPostListDto,
				{
					...(list.toObject?.() ?? list),
					mediaUrl: mediaUrlMap[list._id.toString()],
				},
				{ excludeExtraneousValues: true },
			),
		);

		return {
			items,
			meta: { total, page, limit },
		};
	}

	async deleteSavedPostList(userId: string, listId: string): Promise<void> {
		const list = await this.savedPostListRepo.findById(listId);

		if (!list) throw new EntityNotFound('Danh sách lưu không tồn tại');
		if (list.userId.toString() !== userId) {
			throw new Forbidden('Bạn không có quyền xoá danh sách này');
		}

		// Xoá tất cả các item liên quan trước
		await this.savedPostItemRepo.deleteByListId(listId);

		// Xoá danh sách
		await this.savedPostListRepo.deleteById(listId);
	}

	async addPostsToSavedList(userId: string, listId: string, postIds: string[]): Promise<void> {
		const list = await this.savedPostListRepo.findById(listId);

		if (!list) throw new EntityNotFound('Danh sách lưu không tồn tại');
		if (list.userId.toString() !== userId) {
			throw new Forbidden('Bạn không có quyền cập nhật danh sách này');
		}

		for (const postId of postIds) {
			await this.savedPostItemRepo.create({
				listId: new Types.ObjectId(listId),
				post: new Types.ObjectId(postId),
				savedAt: new Date(),
			});
		}
	}

	async getSavedPosts(
		userId: string,
		listId: string,
		page = 1,
		limit = 10,
	): Promise<{
		items: PostResponseDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const list = await this.savedPostListRepo.findById(listId);
		if (!list) throw new EntityNotFound('Danh sách lưu không tồn tại');
		if (list.userId.toString() !== userId) {
			throw new Forbidden('Bạn không có quyền truy cập danh sách này');
		}

		const { data: savedItems, total } = await this.savedPostItemRepo.findByListIdWithPagination(
			listId,
			page,
			limit,
		);

		const postIds = savedItems.map(item => item.post.toString());

		const posts = await this.postService.findManyByIds(postIds, userId);

		return {
			items: posts,
			meta: { total, page, limit },
		};
	}

	async removeSavedPost(userId: string, listId: string, postId: string): Promise<void> {
		const list = await this.savedPostListRepo.findById(listId);
		if (!list) throw new EntityNotFound('Danh sách lưu không tồn tại');
		if (list.userId.toString() !== userId) {
			throw new Forbidden('Bạn không có quyền sửa danh sách này');
		}

		await this.savedPostItemRepo.removeFromList(listId, postId);
	}
}
