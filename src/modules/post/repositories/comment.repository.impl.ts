import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../entities/comment.schema';
import { ICommentRepository } from './comment.repository';

@Injectable()
export class CommentRepositoryImpl implements ICommentRepository {
	constructor(@InjectModel(Comment.name) private readonly commentModel: Model<Comment>) {}

	async findById(id: string): Promise<Comment | null> {
		return this.commentModel.findById(id).populate('author', '_id fullName avatarUrl').exec();
	}

	async create(comment: Partial<Comment>): Promise<Comment> {
		const created = new this.commentModel(comment);
		return created.save();
	}

	async findByPostIdWithPagination(params: {
		postId: string;
		parentCommentId: string | null;
		page: number;
		limit: number;
	}): Promise<{ data: CommentDocument[]; total: number }> {
		const { postId, parentCommentId, page, limit } = params;
		const filter = {
			postId: new Types.ObjectId(postId),
			parentCommentId: parentCommentId ? new Types.ObjectId(parentCommentId) : null,
		}; // chỉ lấy comment cấp 1

		const [data, total] = await Promise.all([
			this.commentModel
				.find(filter)
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('author', '_id fullName avatarUrl')
				.exec(),
			this.commentModel.countDocuments(filter),
		]);

		return { data, total };
	}

	async updateLikeCount(commentId: string, increment: number): Promise<void> {
		await this.commentModel
			.updateOne({ _id: new Types.ObjectId(commentId) }, { $inc: { likeCount: increment } })
			.exec();
	}

	async updateCommentCount(commentId: string, increment: number): Promise<void> {
		await this.commentModel
			.updateOne({ _id: new Types.ObjectId(commentId) }, { $inc: { commentCount: increment } })
			.exec();
	}

	async findAllByPostId(postId: string): Promise<CommentDocument[]> {
		return this.commentModel.find({ postId: new Types.ObjectId(postId) }).exec();
	}

	async deleteManyByIds(commentIds: string[]): Promise<void> {
		await this.commentModel
			.deleteMany({
				_id: { $in: commentIds.map(id => new Types.ObjectId(id)) },
			})
			.exec();
	}
}
