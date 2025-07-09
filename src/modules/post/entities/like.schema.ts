import { TargetType } from '@common/enum/target-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Like {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	author: Types.ObjectId;

	@Prop({ type: Types.ObjectId, required: true })
	targetId: Types.ObjectId; // ID của Post hoặc Comment

	@Prop({
		type: String,
		enum: ['Post', 'Comment'],
		required: true,
	})
	targetType: TargetType; // Loại của nội dung được like
}

export type LikeDocument = HydratedDocument<Like>;

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ author: 1, targetId: 1, targetType: 1 }, { unique: true });
