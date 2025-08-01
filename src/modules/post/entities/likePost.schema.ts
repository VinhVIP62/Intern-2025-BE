import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikePostDocument = LikePost & Document;

@Schema({ timestamps: true })
export class LikePost {
	@Prop({ required: true })
	postId: string;

	@Prop({ default: [] })
	likeUserIds?: string[];
}

export const LikePostSchema = SchemaFactory.createForClass(LikePost);
