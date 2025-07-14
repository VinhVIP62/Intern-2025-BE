import { RSVP } from '@common/enum/event.member.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class EventMember {
	@Prop({ required: true })
	eventId: string;

	@Prop({ required: true })
	memberId: string;

	@Prop({ required: true, enum: RSVP, default: RSVP.OWNER, type: String })
	state: RSVP;
}

export const EventMemberSchema = SchemaFactory.createForClass(EventMember);

EventMemberSchema.index({ eventId: 1, memberId: 1 });
