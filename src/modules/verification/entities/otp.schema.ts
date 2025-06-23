import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Otp extends Document {
	@Prop({ required: true })
	accInput: string;

	@Prop({ required: true })
	otp: string;
	@Prop({ required: true })
	expiredAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
