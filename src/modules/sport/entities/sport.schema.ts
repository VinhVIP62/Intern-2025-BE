import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Sport {
	@Prop({ required: true, unique: true })
	name: string;

	@Prop()
	description?: string;

	@Prop()
	iconUrl?: string;
}

export type SportDocument = HydratedDocument<Sport>;

export const SportSchema = SchemaFactory.createForClass(Sport);
