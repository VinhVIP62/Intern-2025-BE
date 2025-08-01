import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
	_id: false,
})
export class Image {
	@Prop({ required: true })
	url: string;

	@Prop({ required: true })
	publicId: string;

	@Prop({ required: true, enum: ['image', 'video'] })
	type: string;
}
