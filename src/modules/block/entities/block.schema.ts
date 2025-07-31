import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Block {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	user: Types.ObjectId; // Người chặn

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	blocked: Types.ObjectId; // Người bị chặn

	@Prop({ type: [String], enum: ['post', 'message', 'event'], default: [] })
	blockTypes: string[]; // Chặn kiểu gì (post, message...)
}

export type BlockDocument = HydratedDocument<Block>;

export const BlockSchema = SchemaFactory.createForClass(Block);
BlockSchema.index({ user: 1, blocked: 1 }, { unique: true });
