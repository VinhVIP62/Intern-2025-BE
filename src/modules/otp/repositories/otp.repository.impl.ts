// src/modules/otp/repositories/otp.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from '@modules/otp/entities/otp.schema';
import { IOtpRepository } from '@modules/otp/interfaces/otp.repository';

@Injectable()
export class OtpRepositoryImpl implements IOtpRepository {
	constructor(@InjectModel(Otp.name) private readonly otpModel: Model<Otp>) {}

	async create(email: string, otp: string): Promise<Otp> {
		const newOtp = new this.otpModel({ email, otp });
		return await newOtp.save();
	}

	async findByEmail(email: string): Promise<Otp | null> {
		return await this.otpModel.findOne({ email }).exec();
	}

	async deleteByEmail(email: string): Promise<void> {
		await this.otpModel.deleteMany({ email }).exec();
	}

	async deleteById(id: string): Promise<void> {
		await this.otpModel.findByIdAndDelete(id).exec();
	}
}
