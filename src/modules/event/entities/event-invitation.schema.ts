import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventInvitationStatus } from './event.enum';

@Schema({ timestamps: true })
export class EventInvitation extends Document {
	@Prop({ type: Types.ObjectId, ref: 'Event', required: true })
	eventId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	senderId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	recipientId: Types.ObjectId;

	@Prop({ type: String, enum: EventInvitationStatus, default: EventInvitationStatus.PENDING })
	status: EventInvitationStatus;
}

export const EventInvitationSchema = SchemaFactory.createForClass(EventInvitation);
