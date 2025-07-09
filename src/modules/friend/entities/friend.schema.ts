import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Friend {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) user1: Types.ObjectId;
	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) user2: Types.ObjectId;

	@Prop() createdAt?: Date;
	@Prop() updatedAt?: Date;
}

export type FriendDocument = HydratedDocument<Friend>;

export const FriendSchema = SchemaFactory.createForClass(Friend);
FriendSchema.index({ user1: 1, user2: 1 }, { unique: true });
