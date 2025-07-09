import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) author: Types.ObjectId;
	@Prop({ type: Types.ObjectId, ref: 'Post', required: true }) postId: Types.ObjectId;
	@Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
	parentCommentId: Types.ObjectId | null;

	@Prop({ required: true }) content: string;

	@Prop({ type: Number, default: 0 })
	likeCount: number;

	@Prop({ type: Number, default: 0 })
	commentCount: number;
}

export type CommentDocument = HydratedDocument<Comment>;

export const CommentSchema = SchemaFactory.createForClass(Comment);
