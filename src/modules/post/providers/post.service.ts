import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../dto/createPost.dto';
import { IPostRepository } from '../repositories/post.repository';
import { UpdatePostDto } from '../dto/updattePost.dto';
import { IFriendRepository } from '@modules/friend/repositories/friend.repository';
import { PostMapper } from '../mapper/post.mapper';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepo: IPostRepository,
		private readonly friendRepo: IFriendRepository,
		private readonly postMapper: PostMapper,
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
			const response = await Promise.all(feedFromFriend.map(f => this.postMapper.toResponse(f)));
			return response;
		}
		const feedFromOthers = await this.postRepo.findByExcludingUserIds_InfiniteScroll(
			10,
			friendIds,
			updatedBefore,
		);
		if (feedFromOthers && feedFromOthers.length > 0) {
			const response = await Promise.all(feedFromOthers.map(f => this.postMapper.toResponse(f)));
			return response;
		}
		return { message: 'post.NO_MORE_POSTS' };
	}

	async createPost(userId: string, dto: CreatePostDto) {
		const newPost = await this.postRepo.create({
			userId: userId,
			title: dto.title,
			content: dto.content,
			mediaUrls: dto.mediaUrls || [],
			taggedUserIds: dto.taggedUserIds || [],
		});
		const response = await this.postMapper.toResponse(newPost);
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
		const updatedPost = await this.postRepo.updatePost(postId, body);
		return updatedPost;
	}

	async getUserPosts(userId: string) {
		const posts = await this.postRepo.findByUserId(userId);
		const response = await Promise.all(posts.map(post => this.postMapper.toResponse(post)));
		return response;
	}
}
