import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Sport {
	@Prop({ required: true, unique: true })
	name: string;

	@Prop()
	description?: string;

	@Prop()
	iconUrl?: string;
}

export const SportSchema = SchemaFactory.createForClass(Sport);
