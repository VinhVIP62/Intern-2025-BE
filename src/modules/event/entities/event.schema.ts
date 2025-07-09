import { Location, LocationSchema } from '@modules/location/entities/location.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Event {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	creator: Types.ObjectId;

	@Prop({ required: true })
	title: string;

	@Prop()
	description: string;

	@Prop([String])
	imageUrls: string[];

	@Prop({ type: Types.ObjectId, ref: 'Sport' })
	sport: Types.ObjectId;

	@Prop({ type: LocationSchema })
	location: Location;

	@Prop()
	time: Date;

	@Prop({ required: true, min: 2 })
	maxParticipants: number;

	@Prop({ default: true })
	isPublic: boolean;

	@Prop({ default: false })
	requiresApproval: boolean;

	@Prop({ default: Date.now }) createdAt: Date;
	@Prop({ default: Date.now }) updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
