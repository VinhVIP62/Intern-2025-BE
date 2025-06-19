import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FriendRequestStatus } from './friend-request.enum';

@Schema({ timestamps: true, autoIndex: true })
export class FriendRequest extends Document {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	sender: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	recipient: Types.ObjectId;

	@Prop({
		default: FriendRequestStatus.PENDING,
		index: true,
		enum: Object.values(FriendRequestStatus),
	})
	status: FriendRequestStatus; // 'pending', 'accepted', 'rejected'

	@Prop({ default: null })
	message: string;

	@Prop({ index: true })
	createdAt?: Date;

	@Prop({ index: true })
	updatedAt?: Date;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);

// Setup indexes for better performance
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });
FriendRequestSchema.index({ recipient: 1, status: 1 });
FriendRequestSchema.index({ sender: 1, status: 1 });
FriendRequestSchema.index({ recipient: 1, createdAt: -1 });
FriendRequestSchema.index({ sender: 1, createdAt: -1 });
FriendRequestSchema.index({ status: 1, createdAt: -1 });

// Virtual populate for sender
FriendRequestSchema.virtual('senderUser', {
	ref: 'User',
	localField: 'sender',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for recipient
FriendRequestSchema.virtual('recipientUser', {
	ref: 'User',
	localField: 'recipient',
	foreignField: '_id',
	justOne: true,
});

// Ensure virtual fields are included when converting to JSON
FriendRequestSchema.set('toJSON', { virtuals: true });
FriendRequestSchema.set('toObject', { virtuals: true });
