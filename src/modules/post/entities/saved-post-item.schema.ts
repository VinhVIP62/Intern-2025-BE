import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SavedPostItem {
	@Prop({ type: Types.ObjectId, ref: 'SavedPostList', required: true })
	listId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Post', required: true })
	post: Types.ObjectId;

	@Prop({ default: Date.now })
	savedAt: Date;
}

export const SavedPostItemSchema = SchemaFactory.createForClass(SavedPostItem);
export type SavedPostItemDocument = HydratedDocument<SavedPostItem>;

SavedPostItemSchema.index({ listId: 1, post: 1 }, { unique: true });
