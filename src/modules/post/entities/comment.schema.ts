import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@modules/user/entities/user.schema';
import { Post } from '@modules/post/entities/post.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
	_id: Types.ObjectId;
	@Prop({ type: String, ref: User.name })
	userId: string;
	@Prop({ type: String, ref: Post.name })
	postId: string;

	@Prop()
	content: string;

	@Prop({ default: 0 })
	likeCount?: number = 0;

	@Prop()
	rootCommentId?: string;

	@Prop({ default: null })
	parentCommentId?: string;

	@Prop({ default: true })
	isOriginal?: boolean = true;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Cascade delete middleware - automatically delete child comments when parent is deleted
CommentSchema.pre('findOneAndDelete', async function () {
	const commentId = this.getQuery()._id;
	if (commentId) {
		// Delete all child comments (comments that have this comment as parent)
		await this.model.deleteMany({ parentCommentId: commentId });
		await this.model.db.collection('likecomments').deleteMany({ commentId });
	}
});

CommentSchema.pre('deleteOne', async function () {
	const commentId = this.getQuery()._id;
	if (commentId) {
		// Delete all child comments (comments that have this comment as parent)
		await this.model.deleteMany({ parentCommentId: commentId });
		await this.model.db.collection('likecomments').deleteMany({ commentId });
	}
});

CommentSchema.pre('deleteMany', async function () {
	const query = this.getQuery();

	// Find all comments that match the delete criteria
	const commentsToDelete = await this.model.find(query).select('_id');
	const commentIds = commentsToDelete.map(comment => comment._id);

	if (commentIds.length > 0) {
		// Delete all child comments of these comments
		await this.model.deleteMany({ parentCommentId: { $in: commentIds } });
		await this.model.db.collection('likecomments').deleteMany({ commentId: { $in: commentIds } });
	}
});
