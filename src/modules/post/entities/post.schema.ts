import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PostType, PostStatus } from './post.enum';
import { SportType } from '@modules/user/enums/user.enum';

// Post Schema
@Schema({ timestamps: true, autoIndex: true })
export class Post extends Document {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	author: Types.ObjectId;

	@Prop({ required: true })
	content: string;

	@Prop({ type: String, enum: PostType, default: PostType.TEXT, index: true })
	type: PostType;

	@Prop({ type: [String], default: [] })
	images: string[];

	@Prop({ default: null })
	video: string;

	@Prop({ type: Types.ObjectId, ref: 'Event', default: null, index: true })
	eventId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Group', default: null, index: true })
	groupId: Types.ObjectId;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	likes: Types.ObjectId[];

	@Prop({ type: [String], default: [] })
	hashtags: string[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	taggedUsers: Types.ObjectId[];

	@Prop({ type: Types.ObjectId, ref: 'Post', default: null, index: true })
	sharedFrom: Types.ObjectId;

	@Prop({ default: 0, index: true })
	likeCount: number;

	@Prop({ default: 0, index: true })
	commentCount: number;

	@Prop({ default: 0, index: true })
	shareCount: number;

	@Prop({ type: String, enum: SportType, required: true, index: true })
	sport: SportType;

	// Thêm các biến để quản lý trạng thái duyệt bài
	@Prop({ type: String, enum: PostStatus, default: PostStatus.APPROVED, index: true })
	approvalStatus: PostStatus;

	@Prop({ type: Types.ObjectId, ref: 'User', default: null })
	approvedBy: Types.ObjectId; // Admin đã duyệt bài

	@Prop({ default: null })
	approvedAt: Date; // Thời gian duyệt

	@Prop({ default: null })
	rejectionReason: string; // Lý do từ chối (nếu bị reject)

	@Prop({ type: Types.ObjectId, ref: 'User', default: null })
	rejectedBy: Types.ObjectId; // Admin đã từ chối bài

	@Prop({ default: null })
	rejectedAt: Date; // Thời gian từ chối

	// Remove duplicate index declarations since timestamps: true handles them
	createdAt?: Date;
	updatedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Setup indexes for better performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ sport: 1, createdAt: -1 });
PostSchema.index({ approvalStatus: 1, createdAt: -1 });
PostSchema.index({ groupId: 1, createdAt: -1 });
PostSchema.index({ eventId: 1, createdAt: -1 });
PostSchema.index({ sharedFrom: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });

// Text search index for posts
PostSchema.index({ content: 'text' });

// Virtual populate for comments
PostSchema.virtual('comments', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'postId',
	match: { isActive: true },
});

// Virtual populate for author
PostSchema.virtual('authorUser', {
	ref: 'User',
	localField: 'author',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for event
PostSchema.virtual('event', {
	ref: 'Event',
	localField: 'eventId',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for group
PostSchema.virtual('group', {
	ref: 'Group',
	localField: 'groupId',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for shared from post
PostSchema.virtual('sharedFromPost', {
	ref: 'Post',
	localField: 'sharedFrom',
	foreignField: '_id',
	justOne: true,
});

// Ensure virtual fields are included when converting to JSON
PostSchema.set('toJSON', { virtuals: true });
