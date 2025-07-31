import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from '../type/notification-type.enum';
// import { NotificationMetaModel } from '../type/notification-meta-model.enum';

@Schema({ timestamps: true })
export class Notification {
	@Prop({ type: Types.ObjectId, ref: 'User' })
	actor?: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	receiver: Types.ObjectId;

	@Prop({ type: String, enum: NotificationType, required: true })
	type: NotificationType;

	@Prop({ type: String })
	title?: string;

	@Prop({ type: String })
	content?: string;

	@Prop({ type: Types.ObjectId, refPath: 'metaModel' })
	metaRef?: Types.ObjectId;

	@Prop({ type: String })
	metaModel?: string;

	@Prop({ default: false })
	isRead: boolean;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
