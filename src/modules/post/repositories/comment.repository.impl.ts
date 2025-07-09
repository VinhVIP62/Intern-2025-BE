import { InjectModel } from '@nestjs/mongoose';
import { ICommentRepository } from './comment.repository';
import { Comment } from '../entities/comment.schema';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../dto/create-comment.dto';

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

		return await this.commentModel.create({
			...comment,
			isOriginal: true,
		});
	}
	async findById(id: string): Promise<Comment | null> {
		return await this.commentModel.findById(id);
	}
	async findAll(): Promise<Comment[]> {
		return await this.commentModel.find();
	}
	async findByPostId(postId: string): Promise<Comment[]> {
		const comments = await this.commentModel
			.find({ postId, isOriginal: true })
			.sort({ createdAt: -1 });
		//get reply count
		return await Promise.all(
			comments.map(async comment => {
				const plainComment = JSON.parse(JSON.stringify(comment));
				return {
					...plainComment,
					replyCount: await this.commentModel.countDocuments({
						parentCommentId: comment._id,
					}),
				};
			}),
		);
	}
	async update(id: string, comment: Comment): Promise<Comment | null> {
		return await this.commentModel.findByIdAndUpdate(id, comment, { new: true });
	}
	async delete(userId: string, postId: string, id: string): Promise<Comment> {
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
		return deletedComment;
	}

	async deleteAllByPostId(postId: string): Promise<void> {
		await this.commentModel.deleteMany({ postId });
	}
	async showMoreComment(postId: string, commentId: string): Promise<Comment[]> {
		const comments = await this.commentModel
			.find({ postId, rootCommentId: commentId, isOriginal: false })
			.sort({ createdAt: -1 });
		return comments.map(comment => JSON.parse(JSON.stringify(comment)));
	}
	async getCommentCountByPostId(postId: string): Promise<number> {
		return await this.commentModel.countDocuments({ postId });
	}
}
