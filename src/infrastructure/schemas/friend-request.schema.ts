import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FriendRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ default: 'pending' })
  status: string; // 'pending', 'accepted', 'rejected'

  @Prop({ default: null })
  message: string;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
