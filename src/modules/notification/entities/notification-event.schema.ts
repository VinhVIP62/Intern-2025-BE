import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from '../type/notification-type.enum';

@Schema({ timestamps: true })
export class NotificationEvent {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	actor: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	receiver: Types.ObjectId;

	@Prop({ type: String, enum: NotificationType, required: true })
	type: NotificationType;

	@Prop({ type: Types.ObjectId })
	postId: Types.ObjectId;

	@Prop({ default: false })
	isProcessed: boolean;
}

export type NotificationEventDocument = HydratedDocument<NotificationEvent>;
export const NotificationEventSchema = SchemaFactory.createForClass(NotificationEvent);
