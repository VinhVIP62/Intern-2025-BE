import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { MsgType } from '@common/enum/message/message.type';

@Schema({ timestamps: true })
export class Message {
	@Prop({ required: true })
	fromUserId: string;

	@Prop({ required: true })
	toUserId: string;

	@Prop({ type: String, enum: MsgType, required: true, default: MsgType.TEXT })
	type: MsgType;

	@Prop({ required: false })
	refId: string;

	@Prop({ required: true })
	message: string;

	@Prop()
	createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
