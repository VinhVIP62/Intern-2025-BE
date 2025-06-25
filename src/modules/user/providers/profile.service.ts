import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { IProfileRepository } from '../repositories/profile.repository';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { ProfileMapper } from '../mapper/profile.mapper';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Injectable()
export class ProfileService {
	constructor(private readonly profileRepository: IProfileRepository) {}
	async createProfile(request: CreateProfileDto): Promise<ProfileResponseDto> {
		try {
			const profile = await this.profileRepository.create(request);
			return ProfileMapper.toResponse(profile, 'profile.created');
		} catch (error) {
			throw new ConflictException(`error.profileExists`);
		}
	}
	async getProfile(userId: string): Promise<ProfileResponseDto> {
		try {
			const profile = await this.profileRepository.findById(userId);
			return ProfileMapper.toResponse(profile, 'profile.found');
		} catch (error) {
			throw new NotFoundException(`error.profileNotFound`);
		}
	}
	async updateProfile(request: UpdateProfileDto): Promise<ProfileResponseDto> {
		try {
			const updatedProfile = await this.profileRepository.update(request);
			return ProfileMapper.toResponse(updatedProfile, 'profile.updated');
		} catch (error) {
			throw new NotFoundException(`error.profileNotFound`);
		}
	}
	deleteProfile(userId: string) {
		return this.profileRepository.delete(userId);
	}
	async findProfileById(userId: string): Promise<ProfileResponseDto> {
		try {
			const profile = await this.profileRepository.findById(userId);
			return ProfileMapper.toResponse(profile, 'profile.found');
		} catch (error) {
			throw new NotFoundException(`error.profileNotFound`);
		}
	}
}
