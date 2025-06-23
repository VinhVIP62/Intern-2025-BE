import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IOtp extends Document {
	email: string;
	otp: string;
	createdAt?: Date;
	updatedAt?: Date;
	isValid(): boolean;
}

@Schema({
	timestamps: true,
	autoIndex: true,
})
export class Otp extends Document implements IOtp {
	@Prop({ required: true, unique: true, lowercase: true, index: true })
	email: string;

	@Prop({ required: true, length: 6 })
	otp: string;

	@Prop({ index: true })
	createdAt?: Date;

	@Prop({ index: true })
	updatedAt?: Date;

	isValid(): boolean {
		const now = new Date();
		const createdAt = this.createdAt;
		if (!createdAt) return false;

		const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
		return createdAt > fiveMinutesAgo;
	}
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Tạo compound indexes cho performance
OtpSchema.index({ email: 1, createdAt: -1 });
OtpSchema.index({ otp: 1, email: 1 });

// Text index cho search functionality
OtpSchema.index({ email: 'text' });

// TTL index để tự động xóa sau 5 phút (300 giây)
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// Thêm instance method vào schema để có thể sử dụng trên documents
OtpSchema.methods.isValid = function (): boolean {
	const now = new Date();
	const createdAt = this.createdAt;
	if (!createdAt) return false;

	const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

	return createdAt > fiveMinutesAgo;
};

// Pre-save hook để đảm bảo OTP có đúng 6 ký tự
OtpSchema.pre('save', function () {
	if (this.isModified('otp')) {
		// Đảm bảo OTP có đúng 6 ký tự
		if (this.otp.length !== 6) {
			throw new Error('OTP must be exactly 6 characters long');
		}
	}
});
