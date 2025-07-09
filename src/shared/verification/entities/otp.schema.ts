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

	@Prop({
		required: true,
		enum: ['register', 'login', 'forgot-password', 'add-email', 'add-phone'],
	})
	otpType: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
