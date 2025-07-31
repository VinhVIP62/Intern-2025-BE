import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
	@Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
	conversationId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	sender: Types.ObjectId;

	@Prop({ required: true })
	text: string;

	@Prop({
		type: [
			{
				_id: false,
				url: { type: String, required: true },
				type: {
					type: String,
					required: true,
					enum: ['image', 'video', 'audio', 'file'],
				},
			},
		],
		default: [],
	})
	media: {
		url: string;
		type: 'image' | 'video' | 'audio' | 'file';
	}[];

	@Prop({ type: Types.ObjectId, ref: 'Message', default: null })
	replyTo?: Types.ObjectId;

	@Prop({ type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' })
	status: 'sent' | 'delivered' | 'seen';

	@Prop({ default: false })
	isRevoked: boolean;

	@Prop({ default: Date.now }) createdAt: Date;
	@Prop({ default: Date.now }) updatedAt: Date;
}

export type MessageDocument = HydratedDocument<Message>;

export const MessageSchema = SchemaFactory.createForClass(Message);
