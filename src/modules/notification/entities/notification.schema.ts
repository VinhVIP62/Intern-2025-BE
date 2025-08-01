import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsIn } from 'class-validator';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
	_id: Types.ObjectId;

	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	ownerTypeId: string;

	@Prop({ required: true })
	@IsIn(['event', 'friend'])
	type: string;

	@Prop({ required: true, default: false })
	read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
