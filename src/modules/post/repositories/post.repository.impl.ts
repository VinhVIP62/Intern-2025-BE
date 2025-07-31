import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, PostDocumentWithRestricted } from '../entities/post.schema';
import { IPostRepository } from './post.repository';
import { PostVisibility } from '@common/enum/post-visibility.enum';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
	constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {}

	private filterSharedPostVisibility(
		posts: PostDocument[],
		viewerId: string | null | undefined,
		friendIds: string[] = [],
	) {
		for (const post of posts as PostDocumentWithRestricted[]) {
			const shared = post.sharedPost as PostDocument | undefined;

			if (!shared) continue;

			const sharedAuthorId =
				typeof shared.author === 'object' && shared.author !== null && '_id' in shared.author ?
					(shared.author as { _id: Types.ObjectId })._id.toString()
				:	undefined;

			const isViewerAuthor = viewerId && sharedAuthorId && viewerId === sharedAuthorId;
			const isFriend = sharedAuthorId && friendIds.includes(sharedAuthorId);

			if (shared.visibility === PostVisibility.Private && !isViewerAuthor) {
				post.sharedPost = undefined;
				post.sharedPostIsRestricted = true;
			}

			if (
				shared.visibility === PostVisibility.Friends &&
				!isViewerAuthor &&
				(!viewerId || !isFriend)
			) {
				post.sharedPost = undefined;
				post.sharedPostIsRestricted = true;
			}
		}
	}

	private buildPostVisibilityFilter(
		userId: string | undefined,
		viewerId: string | null | undefined,
		friendIds: string[] = [],
	): any {
		if (!viewerId) return { visibility: PostVisibility.Public };

		const viewerObjectId = new Types.ObjectId(viewerId);

		// Đang xem bài chính mình
		if (!userId || userId === viewerId) {
			return {
				$or: [
					{ visibility: PostVisibility.Public },
					{
						visibility: PostVisibility.Friends,
						author: { $in: friendIds.map(id => new Types.ObjectId(id)) },
					},
					{ author: viewerObjectId },
				],
			};
		}

		// Đang xem người khác
		return {
			$or: [
				{ visibility: PostVisibility.Public },
				{
					visibility: PostVisibility.Friends,
					author: { $in: friendIds.map(id => new Types.ObjectId(id)) },
				}, // 👈 nếu người khác là bạn bè
			],
		};
	}

	async findPostsWithPagination(params: {
		userId?: string;
		viewerId?: string | null;
		page: number;
		limit: number;
		friendIds?: string[];
	}): Promise<{ data: PostDocument[]; total: number }> {
		const { userId, viewerId, page, limit, friendIds } = params;

		const filter: Record<string, unknown> = {};

		if (userId) {
			filter.author = new Types.ObjectId(userId);
		}

		Object.assign(filter, this.buildPostVisibilityFilter(userId, viewerId, friendIds));

		const [data, total] = await Promise.all([
			this.postModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('author', '_id fullName avatarUrl')
				.populate('taggedFriends', '_id fullName avatarUrl')
				.populate({
					path: 'sharedPost',
					populate: [
						{
							path: 'author',
							select: '_id fullName avatarUrl',
						},
						{
							path: 'sports',
							select: '_id name',
						},
					],
				})
				.populate('sports', '_id name iconUrl')
				.lean()
				.exec(),

			this.postModel.countDocuments(filter),
		]);

		this.filterSharedPostVisibility(data, viewerId, friendIds);

		return { data, total };
	}

	async findManyByIds(
		postIds: Types.ObjectId[],
		viewerId: string | null,
		friendIds: string[] = [],
		blockedUserIds: string[] = [],
	): Promise<PostDocument[]> {
		if (postIds.length === 0) return [];

		const filter: Record<string, unknown> = {};
		Object.assign(filter, this.buildPostVisibilityFilter(undefined, viewerId));

		const posts = await this.postModel
			.find({
				_id: { $in: postIds },
				author: { $nin: blockedUserIds.map(id => new Types.ObjectId(id)) },
				...filter,
			})
			.populate('author', '_id fullName avatarUrl')
			.populate('taggedFriends', '_id fullName avatarUrl')
			.populate({
				path: 'sharedPost',
				populate: [
					{
						path: 'author',
						select: '_id fullName avatarUrl',
					},
					{
						path: 'taggedFriends',
						select: '_id fullName avatarUrl',
					},
					{
						path: 'sports',
						select: '_id name',
					},
				],
			})
			.populate('sports', '_id name iconUrl')
			.lean()
			.exec();

		this.filterSharedPostVisibility(posts, viewerId, friendIds);

		// Trả về đúng thứ tự như trong postIds ban đầu (nếu cần)
		const postMap = new Map(posts.map(post => [post._id.toString(), post]));
		return postIds.map(id => postMap.get(id.toString())).filter(Boolean) as PostDocument[];
	}

	async findDetailById(
		postId: string,
		viewerId: string | null,
		friendIds: string[] = [],
	): Promise<PostDocument | null> {
		const post = await this.postModel
			.findById(postId)
			.populate('author', '_id fullName avatarUrl')
			.populate('taggedFriends', '_id fullName avatarUrl')
			.populate({
				path: 'sharedPost',
				populate: [
					{
						path: 'author',
						select: '_id fullName avatarUrl',
					},
					{
						path: 'taggedFriends',
						select: '_id fullName avatarUrl',
					},
					{
						path: 'sports',
						select: '_id name',
					},
				],
			})
			.populate('sports', '_id name iconUrl')
			.lean()
			.exec();

		if (!post) return null;

		this.filterSharedPostVisibility([post], viewerId, friendIds);
		return post;
	}

	async findById(postId: string): Promise<PostDocument | null> {
		const post = await this.postModel
			.findById(postId)
			.populate('author', '_id fullName avatarUrl')
			.exec();
		return post;
	}

	async create(postData: Partial<Post>): Promise<PostDocument> {
		const created = new this.postModel(postData);
		const savedPost = await created.save();
		return savedPost.populate('sports');
	}

	async updateById(postId: string, update: Partial<Post>): Promise<Post | null> {
		return this.postModel
			.findByIdAndUpdate(postId, update, {
				new: true,
			})
			.exec();
	}

	async deleteById(postId: string): Promise<void> {
		await this.postModel.findByIdAndDelete(postId).exec();
	}

	async updateLikeCount(postId: string, increment: number): Promise<void> {
		await this.postModel
			.updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { likeCount: increment } })
			.exec();
	}

	async updateCommentCount(postId: string, increment: number): Promise<void> {
		await this.postModel
			.updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { commentCount: increment } })
			.exec();
	}

	async getFeedPosts(
		userId: string,
		friendIds: string[],
		blockedUserIds: string[] = [],
		page = 1,
		groupLimit = 10,
	): Promise<{
		data: {
			sharedPost: PostDocument | null;
			sharedPostIsRestricted: boolean;
			posts: PostDocument[];
		}[];
		total: number;
	}> {
		const objectUserId = new Types.ObjectId(userId);
		const objectFriendIds = friendIds.map(id => new Types.ObjectId(id));
		const objectBlockedUserIds = blockedUserIds.map(id => new Types.ObjectId(id));
		const skip = (page - 1) * groupLimit;

		// 1. Điều kiện match
		const matchStage = {
			$match: {
				$and: [
					{
						$or: [
							{ visibility: 'public' },
							{ visibility: 'friends', author: { $in: objectFriendIds } },
							{ author: objectUserId },
						],
					},
					{ author: { $nin: objectBlockedUserIds } },
				],
			},
		};

		// 2. Nhóm groupId để tính total nhóm
		const totalGroups: { total: number }[] = await this.postModel.aggregate([
			matchStage,
			{
				$addFields: {
					groupId: { $ifNull: ['$sharedPost', '$_id'] },
				},
			},
			{
				$group: {
					_id: '$groupId',
				},
			},
			{
				$count: 'total',
			},
		]);

		const total = totalGroups[0]?.total || 0;

		// 3. Truy vấn nhóm bài viết
		const groups = await this.postModel.aggregate<{
			_id: Types.ObjectId;
			posts: PostDocument[];
		}>([
			matchStage,
			{
				$addFields: {
					groupId: { $ifNull: ['$sharedPost', '$_id'] },
				},
			},
			{
				$sort: { createdAt: -1 },
			},
			{
				$group: {
					_id: '$groupId',
					posts: { $push: '$$ROOT' },
					latestCreatedAt: { $first: '$createdAt' },
				},
			},
			{
				$sort: { latestCreatedAt: -1 },
			},
			{ $skip: skip },
			{ $limit: groupLimit },
		]);

		// 4. Lấy các bài viết gốc (sharedPost)
		const sharedPostIds = groups
			.filter(g => g._id.toString() !== g.posts[0]._id.toString())
			.map(g => g._id);

		const sharedPostMap = new Map<string, PostDocument>();

		if (sharedPostIds.length) {
			const sharedPosts = await this.postModel
				.find({
					_id: { $in: sharedPostIds },
					$or: [
						{ visibility: 'public' },
						{ visibility: 'friends', author: { $in: objectFriendIds } },
						{ author: objectUserId },
					],
					author: { $nin: objectBlockedUserIds }, // THÊM DÒNG NÀY
				})
				.populate('author', '_id fullName avatarUrl')
				.populate('taggedFriends', '_id fullName avatarUrl')
				.populate('sports', '_id name iconUrl')
				.lean();
			for (const post of sharedPosts) {
				sharedPostMap.set(post._id.toString(), post);
			}
		}

		// 5. Format kết quả
		const postIdsToPopulate = groups.flatMap(g => g.posts.map(p => p._id));

		// Fetch all posts again with population
		const populatedPosts = await this.postModel
			.find({ _id: { $in: postIdsToPopulate } })
			.populate('author', '_id fullName avatarUrl')
			.populate('taggedFriends', '_id fullName avatarUrl')
			.populate('sports', '_id name iconUrl')
			.lean();

		// Create a map to quickly find populated post by ID
		const populatedMap = new Map<string, PostDocument>();
		populatedPosts.forEach(p => populatedMap.set(p._id.toString(), p));

		// 6. Ghép populated post vào lại kết quả
		const items = groups.map(group => {
			const groupId = group._id.toString();
			const isShared = groupId !== group.posts[0]._id.toString();
			const sharedPost = isShared ? (sharedPostMap.get(groupId) ?? null) : null;
			const sharedPostIsRestricted = isShared && !sharedPost;

			const filteredPosts = group.posts
				.filter(p => !sharedPost || p._id.toString() !== sharedPost._id.toString())
				.map(p => populatedMap.get(p._id.toString()))
				.filter(Boolean) as PostDocument[];

			return {
				sharedPost,
				sharedPostIsRestricted,
				posts: filteredPosts,
			};
		});

		// 6. Trả kết quả + meta
		return {
			data: items,
			total,
		};
	}
}
