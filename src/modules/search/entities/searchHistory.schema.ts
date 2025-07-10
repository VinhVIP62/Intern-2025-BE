import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class SearchHistory extends Document {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId;

	@Prop({ type: String, required: false })
	text?: string;

	@Prop({ type: String, required: false })
	hashtag?: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: false })
	user?: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Group', required: false })
	group?: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Event', required: false })
	event?: Types.ObjectId;

	@Prop({ type: Date, default: Date.now })
	createdAt?: Date;
}

export const SearchHistorySchema = SchemaFactory.createForClass(SearchHistory);
