import { Profile } from '../entities/profile.schema';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { IProfileRepository } from './profile.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Injectable()
export class ProfileRepositoryImpl implements IProfileRepository {
	constructor(
		@InjectModel(Profile.name)
		private readonly profileModel: Model<Profile>,
	) {}

	async create(request: CreateProfileDto): Promise<Profile> {
		const existingProfile = await this.profileModel.findOne({ userId: request.userId }).exec();
		if (existingProfile) {
			throw new ConflictException('error.existingProfile');
		}
		const profile = new this.profileModel(request);
		await profile.save();

		return profile;
	}
	async findById(userId: string): Promise<Profile> {
		const profile = await this.profileModel.findOne({ userId }).exec();
		if (!profile) {
			throw new NotFoundException(`error.profileNotFound`);
		}
		return profile;
	}
	async update(request: UpdateProfileDto): Promise<Profile> {
		const userId = request.userId;
		const updatedProfile = await this.profileModel
			.findOneAndUpdate({ userId }, request, { new: true, runValidators: true })
			.exec();
		if (!updatedProfile) {
			throw new NotFoundException(`error.profileNotFound`);
		}
		return updatedProfile;
	}
	async delete(userId: string): Promise<boolean> {
		const result = await this.profileModel.deleteOne({ userId }).exec();
		return result.deletedCount > 0;
	}
}
