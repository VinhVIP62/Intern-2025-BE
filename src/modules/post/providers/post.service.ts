import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../dto/createPost.dto';
import { IPostRepository } from '../repositories/post.repository';
import { UpdatePostDto } from '../dto/updattePost.dto';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepo: IPostRepository,
		private readonly friendRepo: IFriendRepository,
	) {}

	async getNewsfeed(userId: string, updatedBefore?: string) {
		const friend = await this.friendRepo.getAccepted(userId);
		const friendIds = friend.map(f => (f.toUserId === userId ? f.fromUserId : f.toUserId)); // Lấy danh sách bạn bè
		const feedFromFriend = await this.postRepo.findByUserIds_InfiniteScroll(
			10,
			friendIds,
			updatedBefore,
		);
		if (feedFromFriend && feedFromFriend.length > 0) {
			return feedFromFriend;
		}
		const feedFromOthers = await this.postRepo.findByExcludingUserIds_InfiniteScroll(
			10,
			friendIds,
			updatedBefore,
		);
		if (feedFromOthers && feedFromOthers.length > 0) {
			return feedFromOthers;
		}
		return { message: 'post.NO_MORE_POSTS' };
	}

	async createPost(userId: string, dto: CreatePostDto) {
		return await this.postRepo.create({
			userId: userId,
			title: dto.title,
			content: dto.content,
			mediaUrls: dto.mediaUrls || [],
			taggedUserIds: dto.taggedUserIds || [],
		});
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
		return await this.postRepo.updatePost(postId, body);
	}

	async getUserPosts(userId: string) {
		return await this.postRepo.findByUserId(userId);
	}
}
