import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SavedPostList {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId;

	@Prop({ type: String, required: true })
	name: string;
}

export const SavedPostListSchema = SchemaFactory.createForClass(SavedPostList);
export type SavedPostListDocument = HydratedDocument<SavedPostList>;
