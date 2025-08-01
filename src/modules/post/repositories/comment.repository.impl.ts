import { InjectModel } from '@nestjs/mongoose';
import { ICommentRepository } from './comment.repository';
import { Comment } from '../entities/comment.schema';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../dto/request/create-comment.dto';
import { CommentResponseDto } from '../dto/response/comment-response.dto';
import { plainToInstance } from 'class-transformer';

export class CommentRepositoryImpl implements ICommentRepository {
	constructor(@InjectModel(Comment.name) private readonly commentModel: Model<Comment>) {}
	async create(comment: CreateCommentDto, parentCommentId: string | null = null): Promise<Comment> {
		//check if have parent comment
		if (!comment.isOriginal) {
			//when comment is reply comment

			const parentComment = await this.commentModel.findById(parentCommentId);
			if (!parentComment) {
				throw new Error('Parent comment not found');
			}
			const newComment = await this.commentModel.create({
				...comment,
				rootCommentId:
					parentComment.rootCommentId ? parentComment.rootCommentId : parentComment._id.toString(),
				parentCommentId: parentComment._id.toString(),
				isOriginal: false,
			});

			return newComment;
		}

		const newComment = await this.commentModel.create({
			...comment,
			isOriginal: true,
		});
		return newComment;
	}
	async findById(id: string): Promise<CommentResponseDto | null> {
		const comment = await this.commentModel.findById(id);
		return plainToInstance(CommentResponseDto, comment, {
			excludeExtraneousValues: true,
		});
	}
	async findAll(): Promise<CommentResponseDto[]> {
		const comments = await this.commentModel.find();
		return comments.map(comment =>
			plainToInstance(CommentResponseDto, comment, {
				excludeExtraneousValues: true,
			}),
		);
	}
	async findByPostId(
		postId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ comments: CommentResponseDto[]; total: number }> {
		const [comments, total] = await Promise.all([
			this.commentModel
				.find({ postId, isOriginal: true })
				.sort({ createdAt: -1, likesCount: -1 })
				.skip((page - 1) * limit)
				.limit(limit),
			this.commentModel.countDocuments({ postId, isOriginal: true }),
		]);
		//get reply count
		const commentsWithReplyCount = await Promise.all(
			comments.map(async (comment: Comment) => {
				const plainComment = JSON.parse(JSON.stringify(comment));
				return {
					...plainComment,
					replyCount: await this.commentModel.countDocuments({
						rootCommentId: comment._id.toString(),
					}),
				};
			}),
		);
		return {
			comments: commentsWithReplyCount,
			total,
		};
	}
	async update(id: string, comment: Comment): Promise<CommentResponseDto | null> {
		return await this.commentModel.findByIdAndUpdate(id, comment, { new: true });
	}
	async delete(userId: string, postId: string, id: string): Promise<CommentResponseDto> {
		const comment = await this.commentModel.findById(id);

		//delete all child comment if comment is original
		if (comment?.isOriginal) {
			await this.commentModel.deleteMany({ rootCommentId: id });
		}

		// Delete the comment - child comments will be automatically deleted by Mongoose middleware
		const deletedComment = await this.commentModel.findByIdAndDelete(id);
		if (!deletedComment) {
			throw new Error('Comment not found');
		}
		return plainToInstance(CommentResponseDto, deletedComment, {
			excludeExtraneousValues: true,
		});
	}

	async deleteAllByPostId(postId: string): Promise<void> {
		await this.commentModel.deleteMany({ postId });
	}
	async showMoreComment(
		postId: string,
		commentId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ comments: CommentResponseDto[]; total: number }> {
		const [comments, total] = await Promise.all([
			this.commentModel
				.find({ postId, rootCommentId: commentId, isOriginal: false })
				.sort({ createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit),
			this.commentModel.countDocuments({ postId, rootCommentId: commentId, isOriginal: false }),
		]);
		return {
			comments: await Promise.all(
				comments.map(async (comment: Comment) => {
					const plainComment = JSON.parse(JSON.stringify(comment));
					return {
						...plainComment,
						replyCount: await this.commentModel.countDocuments({
							parentCommentId: comment._id.toString(),
						}),
					};
				}),
			),
			total,
		};
	}
	async getCommentCountByPostId(postId: string): Promise<number> {
		return await this.commentModel.countDocuments({ postId });
	}
	async findOne(query: any): Promise<CommentResponseDto | null> {
		const comment = await this.commentModel.findOne(query);
		return plainToInstance(CommentResponseDto, comment, {
			excludeExtraneousValues: true,
		});
	}
}
