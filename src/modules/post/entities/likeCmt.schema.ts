import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikeCommentDocument = LikeComment & Document;

@Schema({ timestamps: true })
export class LikeComment {
	@Prop({ required: true })
	postId: string;
	@Prop({ required: true })
	commentId: string;
	@Prop({ required: true })
	userId: string;
	@Prop({ default: [] })
	likedUserIds: string[];
}

export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);
