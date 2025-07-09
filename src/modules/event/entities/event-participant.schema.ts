import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class EventParticipant {
	@Prop({ type: Types.ObjectId, ref: 'Event', required: true }) event: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) user: Types.ObjectId;

	@Prop({ enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' })
	status: 'pending' | 'accepted' | 'rejected' | 'cancelled';

	@Prop({ default: null }) respondedAt: Date;
}

export const EventParticipantSchema = SchemaFactory.createForClass(EventParticipant);

EventParticipantSchema.index({ event: 1, user: 1 }, { unique: true });
