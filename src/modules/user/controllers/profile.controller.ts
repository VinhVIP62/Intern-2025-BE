import { ResponseEntity } from '@common/types';
import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Version } from '@nestjs/common/decorators/core/version.decorator';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { ProfileService } from '../providers/profile.service';
import { Response } from '@common/decorators/response.decorator';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Request } from 'express';

@Controller('profile')
export class ProfileController {
	// Các phương thức sẽ được định nghĩa ở đây
	// Ví dụ: getProfile, updateProfile, deleteProfile, v.v.

	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@Version('1')
	@ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng' })
	@ApiResponse({ status: 200, description: 'Thành công lấy thông tin hồ sơ người dùng' })
	@Response()
	async getProfile(@Query('userId') userId: string): Promise<ResponseEntity<ProfileResponseDto>> {
		// Logic để lấy thông tin hồ sơ người dùng
		const response = await this.profileService.getProfile(userId);
		return {
			success: true,
			data: response,
		};
	}
	@Post('create')
	@Version('1')
	@ApiOperation({ summary: 'Tạo mới hồ sơ người dùng' })
	@ApiResponse({ status: 201, description: 'Thành công tạo mới hồ sơ người dùng' })
	@Response()
	async createProfile(
		@Body() createProfileDto: CreateProfileDto,
	): Promise<ResponseEntity<ProfileResponseDto>> {
		console.log('Creating profile');
		const response = await this.profileService.createProfile(createProfileDto);
		return {
			success: true,
			data: response,
		};
	}
	@Post('update')
	@Version('1')
	@ApiOperation({ summary: 'Cập nhật hồ sơ người dùng' })
	@ApiResponse({ status: 200, description: 'Thành công cập nhật hồ sơ người dùng' })
	@Response()
	async updateProfile(
		@Body() updateProfileDto: UpdateProfileDto,
	): Promise<ResponseEntity<ProfileResponseDto>> {
		const response = await this.profileService.updateProfile(updateProfileDto);
		return {
			success: true,
			data: response,
		};
	}

	@Get('me')
	@Version('1')
	@ApiOperation({ summary: 'Lấy thông tin hồ sơ của người dùng hiện tại' })
	@ApiResponse({
		status: 200,
		description: 'Thành công lấy thông tin hồ sơ của người dùng hiện tại',
	})
	@Response()
	async getCurrentUserProfile(
		@Req() request: Request,
	): Promise<ResponseEntity<ProfileResponseDto>> {
		const user = request.user;
		const response = await this.profileService.findProfileById(user.id);
		return {
			success: true,
			data: response,
		};
	}
}
