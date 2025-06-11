import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  type: string; // 'friend_request', 'event_invitation', 'group_invitation', 'like', 'comment', etc.

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, refPath: 'referenceModel', default: null })
  referenceId: Types.ObjectId;

  @Prop({ default: null })
  referenceModel: string; // 'Post', 'Event', 'Group', etc.

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
