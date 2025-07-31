import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EventParticipant {
	@Prop({ type: Types.ObjectId, ref: 'Event', required: true }) event: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) user: Types.ObjectId;

	@Prop({ enum: ['pending', 'accepted', 'rejected', 'cancelled', 'invited'], default: 'pending' })
	status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'invited';

	@Prop({ default: null }) respondedAt: Date;

	@Prop({ default: Date.now }) createdAt: Date;
	@Prop({ default: Date.now }) updatedAt: Date;
}

export type EventParticipantDocument = HydratedDocument<EventParticipant>;

export const EventParticipantSchema = SchemaFactory.createForClass(EventParticipant);

EventParticipantSchema.index({ event: 1, user: 1 }, { unique: true });
