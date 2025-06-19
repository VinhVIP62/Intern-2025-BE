import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, autoIndex: true })
export class Notification extends Document {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	recipient: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	sender: Types.ObjectId;

	@Prop({ required: true, index: true })
	type: string; // 'friend_request', 'event_invitation', 'group_invitation', 'like', 'comment', 'post_approved', 'post_rejected', etc.

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	message: string;

	@Prop({ type: Types.ObjectId, refPath: 'referenceModel', default: null, index: true })
	referenceId: Types.ObjectId;

	@Prop({ default: null, index: true })
	referenceModel: string; // 'Post', 'Event', 'Group', etc.

	@Prop({ default: false, index: true })
	isRead: boolean;

	@Prop({ default: true, index: true })
	isActive: boolean;

	@Prop({ index: true })
	createdAt?: Date;

	@Prop({ index: true })
	updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Setup indexes for better performance
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ isActive: 1, isRead: 1 });
NotificationSchema.index({ referenceModel: 1, referenceId: 1 });

// Virtual populate for recipient
NotificationSchema.virtual('recipientUser', {
	ref: 'User',
	localField: 'recipient',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for sender
NotificationSchema.virtual('senderUser', {
	ref: 'User',
	localField: 'sender',
	foreignField: '_id',
	justOne: true,
});

// Ensure virtual fields are included when converting to JSON
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });
