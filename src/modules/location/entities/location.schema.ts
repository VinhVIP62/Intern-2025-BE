import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Location {
	@Prop({ enum: ['Point'], default: 'Point' })
	type: 'Point';

	@Prop({
		type: [Number],
		required: true,
		index: '2dsphere',
	})
	coordinates: [number, number];

	@Prop() address: string;

	@Prop() city: string;

	@Prop() district: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
