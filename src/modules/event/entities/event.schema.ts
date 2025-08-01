import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Image } from '@shared/schema/image.schema';
import { IsOptional } from 'class-validator';

export type EventDocument = Event & Document;

@Schema({
	collection: 'events',
	timestamps: true,
})
export class Event {
	_id: Types.ObjectId;

	@Prop({ required: true })
	authorId: string;

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	startDate: Date;

	@Prop({ required: true })
	endDate: Date;

	@Prop({ required: true })
	location: string;

	@Prop({ type: [Image], default: [] })
	images: Image[];

	@Prop({ default: 0 })
	userJoin: number;

	@Prop({ default: 100 })
	maxJoin: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
// Trong file schema Event
EventSchema.index({ title: 'text', description: 'text' }); // Text index cho tìm kiếm từ khóa
EventSchema.index({ location: 1, startDate: 1 }); // Compound index cho lọc địa điểm và thời gian
