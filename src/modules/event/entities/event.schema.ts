import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Sports } from '@common/enum/sports.enum';
import { EventState } from '@common/enum/event.state';

@Schema({ timestamps: true })
export class Event {
	@Prop({ default: () => randomUUID(), index: true })
	id: string;

	@Prop({ required: true })
	title: string;

	@Prop()
	content?: string;

	@Prop({ type: String, enum: EventState, default: EventState.PUBLIC })
	state: string;

	@Prop({
		type: { type: String, enum: ['Point'], default: 'Point' },
		coordinates: [Number],
	})
	location: {
		type: 'Point';
		coordinates: [number, number];
	};

	@Prop({
		type: {
			country: { type: String },
			province: { type: String },
			district: { type: String },
			ward: { type: String },
			street: { type: String },
		},
		required: false,
	})
	address?: {
		country?: string;
		province?: string;
		district?: string;
		ward?: string;
		street?: string;
	};

	@Prop({ required: true })
	startTime: Date;

	@Prop()
	endTime?: Date;

	@Prop({
		type: [String],
		enum: Sports,
		default: [],
	})
	sportInterests: Sports[];

	@Prop({ type: [String], default: [] })
	mediaUrls: string[];

	@Prop({ type: Number, default: 0 })
	interestedCount: number;

	@Prop({ default: false })
	isDeleted: boolean;

	@Prop({ default: 0 })
	numOfMem: number;

	@Prop({ required: true })
	ownerId: string;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ location: '2dsphere' });
EventSchema.index({ ownerId: 1 });
