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
	description?: string;

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

	@Prop({ type: Map, of: Number, default: {} })
	reactsCount: Map<string, number>;

	@Prop({ default: 0 })
	commentsCount: number;

	@Prop({ default: false })
	isDeleted: boolean;

	@Prop({ required: true })
	ownerId: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ location: '2dsphere' });
EventSchema.index({ ownerId: 1 });
