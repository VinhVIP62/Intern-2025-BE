import { InjectModel } from '@nestjs/mongoose';
import { IPostRepository } from './post.repository';
import { Post, PostDocument } from '../entities/post.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreatePostDto } from '../dto/request/create-post.dto';
import { UpdatePostDto } from '../dto/request/update-post.dto';
import { PostQueryDto } from '../dto/request/post-query.dto';
import Fuse from 'fuse.js';
import { User } from '@modules/user/entities/user.schema';
import {
	BasePostResponseDto,
	PostResponseDto,
	PostSearchResponseDto,
} from '../dto/response/post-response.dto';

export class PostRepositoryImpl implements IPostRepository {
	constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {}
	async create(post: CreatePostDto): Promise<PostDocument> {
		return await this.postModel.create(post);
	}
	async findById(id: string): Promise<BasePostResponseDto | null> {
		const post = await this.postModel.findById(id).populate<{ userId: User }>('userId');
		if (!post) {
			return null;
		}
		return {
			...JSON.parse(JSON.stringify(post)),
			postId: post._id.toString(),
			userId: post.userId._id.toString(),
			fullName: post.userId.fullName,
			avatar: post.userId.avatar,
		};
	}
	async findAll(): Promise<PostResponseDto[]> {
		const posts = await this.postModel.find().populate<{ userId: User }>('userId');
		return posts.map(post => ({
			...JSON.parse(JSON.stringify(post)),
			postId: post._id.toString(),
			userId: post.userId._id.toString(),
			fullName: post.userId.fullName,
			avatar: post.userId.avatar,
		}));
	}
	async findByUserId(userId: string): Promise<PostResponseDto[]> {
		const posts = await this.postModel.find().populate<{ userId: User }>('userId');
		return posts.map(post => ({
			...JSON.parse(JSON.stringify(post)),
			postId: post._id.toString(),
			userId: post.userId._id.toString(),
			fullName: post.userId.fullName,
			avatar: post.userId.avatar,
		}));
	}
	async update(id: string, post: UpdatePostDto): Promise<PostResponseDto | null> {
		const updatedPost = await this.postModel
			.findByIdAndUpdate(id, post, { new: true })
			.populate<{ userId: User }>('userId');
		if (!updatedPost) {
			return null;
		}
		return {
			...JSON.parse(JSON.stringify(updatedPost)),
			postId: updatedPost._id.toString(),
			userId: updatedPost.userId._id.toString(),
			fullName: updatedPost.userId.fullName,
			avatar: updatedPost.userId.avatar,
		};
	}
	async delete(id: string): Promise<PostDocument | null> {
		return await this.postModel.findByIdAndDelete(id);
	}
	async findAllWithPagination(
		mongoQuery: any,
		paramQuery: any,
	): Promise<{ posts: PostResponseDto[]; total: number }> {
		const { page, limit, sortBy, sortOrder } = paramQuery;

		const skip = (page ? page - 1 : 0) * (limit ? limit : 10);
		const sortField = sortBy === 'createdAt' ? 'createdAt' : 'content';
		const sortWithOrder = sortOrder === 'asc' ? 1 : -1;
		const limited = limit ? limit : 10;

		const [posts, total] = await Promise.all([
			this.postModel
				.find(mongoQuery)
				.sort({ [sortField]: sortWithOrder })
				.populate<{ userId: User }>('userId')
				.populate<{ originalPostUserId: User }>('originalPostUserId')
				.skip(skip)
				.limit(limited)
				.exec(),
			this.postModel.countDocuments(mongoQuery).exec(),
		]);
		return {
			posts: posts.map(post => ({
				...JSON.parse(JSON.stringify(post)),
				postId: post._id.toString(),
				userId: post.userId._id.toString(),
				fullName: post.userId.fullName,
				avatar: post.userId.avatar,
				originalPostId: post.originalPostId || '',
				originalPrivacy: post.originalPrivacy || '',
				originalPostUserId: post.originalPostUserId?._id.toString() || '',
				originalPostFullName: post.originalPostUserId?.fullName || '',
				originalPostAvatar: post.originalPostUserId?.avatar || '',
			})),
			total,
		};
	}
	async likePost(postId: string): Promise<PostResponseDto | null> {
		const likedPost = await this.postModel
			.findByIdAndUpdate(
				postId,
				{
					$inc: { likeCount: 1 },
				},
				{ new: true },
			)
			.populate<{ userId: User }>('userId');
		if (!likedPost) {
			return null;
		}
		return {
			...JSON.parse(JSON.stringify(likedPost)),
			postId: likedPost._id.toString(),
			userId: likedPost.userId._id.toString(),
			fullName: likedPost.userId.fullName,
			avatar: likedPost.userId.avatar,
		};
	}
	async unlikePost(postId: string): Promise<PostResponseDto | null> {
		//remove user from likedUserIds
		const likedPost = await this.postModel
			.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { new: true })
			.populate<{ userId: User }>('userId');
		if (!likedPost) {
			return null;
		}
		return {
			...JSON.parse(JSON.stringify(likedPost)),
			postId: likedPost._id.toString(),
			userId: likedPost.userId._id.toString(),
			fullName: likedPost.userId.fullName,
			avatar: likedPost.userId.avatar,
		};
	}
	async sharePost(postId: string, post: CreatePostDto): Promise<PostDocument | null> {
		const sharedPost = await this.postModel.findById(postId);
		if (!sharedPost) {
			return null;
		}
		if (sharedPost.originalPostId) {
			const newPost = await this.create({
				...post,
				originalPostId: sharedPost.originalPostId,
				originalPostUserId: sharedPost.originalPostUserId,
				originalPrivacy: sharedPost.originalPrivacy,
			});
			await this.postModel.findByIdAndUpdate(postId, {
				$inc: { shareCount: 1 },
			});
			return newPost;
		}
		//share post originalPostId is null
		return await this.create({
			...post,
			originalPostId: postId,
			originalPostUserId: sharedPost.userId,
			originalPrivacy: sharedPost.privacy,
		});
	}
	async search(query: string): Promise<{ posts: PostSearchResponseDto[] }> {
		// if (!query || query.trim() === '') return [];
		// console.log('Post Repository - Received query:', query);
		//check case public, private, friends, do later
		// const result = this.postModel.find({
		// 	$or: [
		// 		{ title: { $regex: query, $options: 'i' } },
		// 		{ content: { $regex: query, $options: 'i' } },
		// 	],
		// });

		// return result;
		const allPosts = await this.postModel
			.find()
			.populate<{ userId: User }>('userId')
			.populate<{ originalPostUserId: User }>('originalPostUserId')
			.lean();
		const fuse = new Fuse(allPosts, {
			keys: ['title', 'content'],
			threshold: 0.3,
		});
		const results = fuse.search(query);
		// console.log('results', results);
		return {
			posts: results.map(result => ({
				...result.item,
				postId: result.item._id.toString(),
				userId: result.item.userId?._id.toString(),
				fullName: result.item.userId?.fullName || '',
				avatar: result.item.userId?.avatar || '',
				title: result.item.title || '',
				content: result.item.content || '',
				images: result.item.images || [],
				privacy: result.item.privacy,
				originalPostId: result.item.originalPostId || '',
				originalPrivacy: result.item.originalPrivacy || '',
				originalPostUserId: result.item.originalPostUserId?._id.toString() || '',
				originalPostFullName: result.item.originalPostUserId?.fullName || '',
				originalPostAvatar: result.item.originalPostUserId?.avatar || '',
			})),
		};
	}
}
