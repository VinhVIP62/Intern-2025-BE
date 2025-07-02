import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventStatus } from './event.enum';
import { SportType } from '@modules/user/enums/user.enum';

// Event Schema
@Schema({ timestamps: true })
export class Event extends Document {
	@Prop({ required: true, trim: true })
	title: string;

	@Prop({ default: null })
	description: string;

	@Prop({ default: null })
	image: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	organizer: Types.ObjectId;

	@Prop({ type: String, enum: SportType, required: true })
	sport: SportType;

	@Prop({ required: true })
	startDate: Date;

	@Prop({ required: true })
	endDate: Date;

	@Prop({
		type: {
			name: String,
			address: String,
			city: String,
			district: String,
		},
		required: true,
	})
	location: {
		name: string;
		address: string;
		city: string;
		district: string;
	};

	@Prop({ default: 1 })
	minParticipants: number;

	@Prop({ required: true })
	maxParticipants: number;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	participants: Types.ObjectId[];

	@Prop({ type: String, enum: EventStatus, default: EventStatus.UPCOMING })
	status: EventStatus;

	@Prop({ default: 0 })
	participantCount: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Setup indexes for better performance
EventSchema.index({ organizer: 1, startDate: 1 });
EventSchema.index({ sport: 1, startDate: 1 });
EventSchema.index({ status: 1, startDate: 1 });

// Virtual populate for participants
EventSchema.virtual('participantUsers', {
	ref: 'User',
	localField: 'participants',
	foreignField: '_id',
});

// Virtual populate for organizer
EventSchema.virtual('organizerUser', {
	ref: 'User',
	localField: 'organizer',
	foreignField: '_id',
	justOne: true,
});

// Ensure virtual fields are included when converting to JSON
EventSchema.set('toJSON', {
	virtuals: true,
	transform: function (doc, ret) {
		delete ret.id;
		return ret;
	},
});
