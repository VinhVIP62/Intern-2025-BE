import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
	@Prop()
	userId: string;
	@Prop()
	postId: string;

	@Prop()
	content: string;

	@Prop({ default: [] })
	likedUserIds?: string[];

	@Prop()
	rootCommentId?: string;

	@Prop({ default: null })
	parentCommentId?: string;

	@Prop({ default: true })
	isOriginal?: boolean = true;

	@Prop({ default: 0 })
	replyCount?: number = 0;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Cascade delete middleware - automatically delete child comments when parent is deleted
CommentSchema.pre('findOneAndDelete', async function () {
	const commentId = this.getQuery()._id;
	if (commentId) {
		// Delete all child comments (comments that have this comment as parent)
		await this.model.deleteMany({ parentCommentId: commentId });
	}
});

CommentSchema.pre('deleteOne', async function () {
	const commentId = this.getQuery()._id;
	if (commentId) {
		// Delete all child comments (comments that have this comment as parent)
		await this.model.deleteMany({ parentCommentId: commentId });
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
	}
});
