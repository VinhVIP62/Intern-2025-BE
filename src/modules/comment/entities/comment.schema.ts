import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Comment Schema
@Schema({ timestamps: true, autoIndex: true })
export class Comment extends Document {
	@Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
	postId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	author: Types.ObjectId;

	@Prop({ required: true })
	content: string;

	@Prop({ type: Types.ObjectId, ref: 'Comment', default: null, index: true })
	parentId: Types.ObjectId;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	likes: Types.ObjectId[];

	@Prop({ default: true, index: true })
	isActive: boolean;

	@Prop({ default: false, index: true })
	isHidden: boolean;

	@Prop({ default: 0, index: true })
	likeCount: number;

	@Prop({ default: 0, index: true })
	replyCount: number;

	createdAt?: Date;
	updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Setup indexes for better performance
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, createdAt: -1 });
CommentSchema.index({ isActive: 1, createdAt: -1 });

// Text search index for comments
CommentSchema.index({ content: 'text' });

// Virtual populate for replies
CommentSchema.virtual('replies', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'parentId',
	match: { isActive: true, isHidden: false },
});

// Virtual populate for author
CommentSchema.virtual('authorUser', {
	ref: 'User',
	localField: 'author',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for post
CommentSchema.virtual('post', {
	ref: 'Post',
	localField: 'postId',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for parent comment
CommentSchema.virtual('parentComment', {
	ref: 'Comment',
	localField: 'parentId',
	foreignField: '_id',
	justOne: true,
});

// Ensure virtual fields are included when converting to JSON
CommentSchema.set('toJSON', { virtuals: true });
