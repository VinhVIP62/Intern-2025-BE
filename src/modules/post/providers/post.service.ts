import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/createPost.dto';
import { IPostRepository } from '../repositories/interfaces/post.repository';
import { UpdatePostDto } from '../dto/updattePost.dto';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { PostMapper } from '../mapper/post.mapper';
import { SearchService } from '@modules/search/search.service';
import { PostState } from '@common/enum/post/post.state.enum';
import { MentionHelper } from '@common/utils/mention.util';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { FriendState } from '@common/enum/friend/friend.state.enum';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepo: IPostRepository,
		private readonly friendRepo: IFriendRepository,
		private readonly postMapper: PostMapper,
		private readonly searchService: SearchService,
		private readonly notiService: NotificationService,
	) {}

	async getNewsfeed(userId: string, updatedBefore?: string) {
		const friend = await this.friendRepo.getAccepted(userId);
		const friendIds = friend.map(f => (f.toUserId === userId ? f.fromUserId : f.toUserId)); // Lấy danh sách bạn bè
		friendIds.unshift(userId);
		const feedFromFriend = await this.postRepo.findByUserIds_InfiniteScroll(
			10,
			friendIds,
			updatedBefore,
		);
		if (feedFromFriend && feedFromFriend.length > 0) {
			const response = await Promise.all(
				feedFromFriend.map(f => this.postMapper.toResponse(f, userId)),
			);
			return response;
		}
		const feedFromOthers = await this.postRepo.findByExcludingUserIds_InfiniteScroll(
			10,
			friendIds,
			updatedBefore,
		);
		if (feedFromOthers && feedFromOthers.length > 0) {
			const response = await Promise.all(
				feedFromOthers.map(f => this.postMapper.toResponse(f, userId)),
			);
			return response;
		}
		return { message: 'post.NO_MORE_POSTS' };
	}

	async createPost(userId: string, dto: CreatePostDto) {
		const taggedUserIds = MentionHelper.extractUserIdsFromContent(dto.title + ' ' + dto.content);

		if (dto.state === PostState.ONLY_ME && taggedUserIds.length > 0)
			throw new ConflictException('post.FORBIDDEN');

		const newPost = await this.postRepo.create({
			userId: userId,
			title: dto.title,
			content: dto.content,
			state: dto.state,
			mediaUrls: dto.mediaUrls || [],
			taggedUserIds: taggedUserIds,
		});

		await Promise.all(
			taggedUserIds.map(async taggedUserId => {
				await this.notiService.postTaggedUserNoti(userId, newPost.id, taggedUserId);
			}),
		);

		const response = await this.postMapper.toResponse(newPost, userId);
		if (dto?.state === PostState.ONLY_ME || PostState.FRIEND) return response;
		await this.searchService.index('post', newPost.id, {
			id: newPost.id,
			ownerFirstName: response.ownerFirstName,
			ownerLastName: response.ownerLastName,
			title: newPost.title,
			content: newPost.content,
		});

		return response;
	}

	async updatePost(userId: string, postId: string, body: UpdatePostDto) {
		const post = await this.postRepo.findById(postId);
		if (post === null) {
			throw new NotFoundException('post.NOT_FOUND');
		}
		const owner = post.userId;
		if (userId !== owner) {
			throw new ForbiddenException('post.FORBIDDEN');
		}

		const taggedUserIds = MentionHelper.extractUserIdsFromContent(body.title + ' ' + body.content);

		if (body.state === PostState.ONLY_ME && taggedUserIds.length > 0)
			throw new ConflictException('post.FORBIDDEN');
		const oldTaggedUserIds = post.taggedUserIds;
		if (oldTaggedUserIds.length > 0) {
			const newTaggedUserIds = taggedUserIds.filter(userId => !oldTaggedUserIds.includes(userId));

			await Promise.all(
				newTaggedUserIds.map(async taggedUserId => {
					await this.notiService.postTaggedUserNoti(userId, postId, taggedUserId);
				}),
			);
		}

		const updatedPost = await this.postRepo.updatePost(postId, body);
		return updatedPost;
	}

	async getUserPosts(myId: string, userId: string, limit: number = 10, updatedBefore?: Date) {
		const isOwner = myId === userId;
		let postStates: PostState[];

		if (isOwner) {
			postStates = [PostState.ONLY_ME, PostState.FRIEND, PostState.PUBLIC];
		} else {
			const friend = await this.friendRepo.findBetween(myId, userId);

			postStates =
				friend?.state === FriendState.ACCEPTED ?
					[PostState.FRIEND, PostState.PUBLIC]
				:	[PostState.PUBLIC];
		}

		const posts = await this.postRepo.findByUserId(userId, postStates, limit, updatedBefore);
		const response = await Promise.all(posts.map(post => this.postMapper.toResponse(post, userId)));

		return response;
	}

	async getPostById(userId: string, postId: string) {
		const post = await this.postRepo.findById(postId);
		if (!post) throw new NotFoundException('post.NOT_FOUND');
		return await this.postMapper.toResponse(post, userId);
	}

	async deletePost(userId: string, postId: string) {
		const post = await this.postRepo.findById(postId);
		if (!post) throw new NotFoundException('post.NOT_FOUND');
		if (post.userId !== userId) throw new ForbiddenException('post.FORBIDDEN');

		await this.postRepo.updatePost(postId, { isDeleted: true });
		await this.searchService.delete('post', postId);
		return { message: 'post.DELETED' };
	}
}
