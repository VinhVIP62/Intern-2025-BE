import { NotificationType } from '@common/enum/notification/notification.type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ timestamps: true })
export class Notification {
	@Prop({
		default: () => randomUUID(),
		index: true,
	})
	id: string;

	@Prop({ required: true })
	messageKey: string;

	@Prop({ enum: NotificationType, type: String, default: NotificationType.SYSTEM })
	type: NotificationType;

	@Prop({ type: Object, default: {} })
	metadata: Record<string, any>;

	@Prop({ default: false })
	isRead: boolean;

	@Prop({ required: true })
	toUserId: string;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
