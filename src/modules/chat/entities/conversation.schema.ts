import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation {
	@Prop({ type: [Types.ObjectId], ref: 'User', required: true })
	participants: Types.ObjectId[];

	@Prop({ type: Boolean, default: false })
	isGroup: boolean;

	@Prop({ type: Types.ObjectId, ref: 'User', default: null })
	owner?: Types.ObjectId;

	@Prop({ type: String, default: null })
	name?: string; // nếu là group

	@Prop({ type: String, default: null })
	avatarUrl?: string;

	@Prop({
		type: {
			_id: false,
			text: String,
			sender: { type: Types.ObjectId, ref: 'User' },
			status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
			createdAt: Date,
		},
		default: null,
	})
	lastMessage?: {
		text: string;
		sender: Types.ObjectId;
		status: 'sent' | 'delivered' | 'seen';
		createdAt: Date;
	};

	@Prop({ default: Date.now }) createdAt: Date;
	@Prop({ default: Date.now }) updatedAt: Date;
}

export type ConversationDocument = HydratedDocument<Conversation>;

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
