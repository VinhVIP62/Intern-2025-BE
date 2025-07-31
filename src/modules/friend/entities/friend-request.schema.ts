import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FriendRequest {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) sender: Types.ObjectId;
	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) receiver: Types.ObjectId;
	@Prop({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' }) status: string;

	@Prop() createdAt?: Date;
	@Prop() updatedAt?: Date;
}

export type FriendRequestDocument = HydratedDocument<FriendRequest>;

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
