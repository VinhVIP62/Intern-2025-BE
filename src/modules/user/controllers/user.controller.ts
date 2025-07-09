import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard, JwtAuthGuard } from '@common/guards';
import {
	Controller,
	Get,
	UseGuards,
	Version,
	Post,
	Body,
	Req,
	Delete,
	UseInterceptors,
	UploadedFile,
	HttpStatus,
	ParseFilePipeBuilder,
	BadRequestException,
	NotFoundException,
	Param,
	Put,
	ConflictException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RemoveContactDto, AddContactDto } from '../dto/manage-contacts.dto';
import { UserService } from '../providers/user.service';
import { Request } from 'express';
import { UploadService } from '../../../shared/upload/providers/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { verificationService } from '../../../shared/verification/providers/verification.service';
import { isEmailOrPhone } from '@common/utils/check-email-or-phone';
import { ImageType } from '@common/enum/image.enum';
import { Response } from '@common/decorators/response.decorator';

@Controller()
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly uploadService: UploadService,
		private readonly verificationService: verificationService,
	) {}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Response()
	@ApiBearerAuth()
	@Put('upload-avatar')
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: 'jpeg|png|jpg|webp|bmp',
				})
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 5,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
		@Req() req: Request,
	) {
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}
		const userId = (req.user as any).id;
		try {
			const { url, publicId } = await this.uploadService.uploadAvatar(file, userId);
			const data = await this.userService.update(userId, { avatar: url, avatarPublicId: publicId });
			// console.log('avatar url', url);
			return {
				success: true,
				message: 'Avatar uploaded successfully',
				data: data,
			};
		} catch (error) {
			throw new BadRequestException('Failed to upload avatar');
		}
	}
	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Response()
	@ApiBearerAuth()
	@Put('upload-background')
	@UseInterceptors(FileInterceptor('file'))
	async uploadBackground(
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: 'jpeg|png|jpg|webp|bmp|heic',
				})
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 5,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		try {
			const { url, publicId } = await this.uploadService.uploadBackground(file, userId);
			const data = await this.userService.update(userId, {
				background: url,
				backgroundPublicId: publicId,
			});
			return {
				success: true,
				message: 'Background uploaded successfully',
				data: data,
			};
		} catch (error) {
			throw new BadRequestException('Failed to upload background');
		}
	}
	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Response()
	@ApiBearerAuth()
	@Put('upload-image/:type')
	@UseInterceptors(FileInterceptor('file'))
	async uploadUserImage(
		@Param('type') type: ImageType.AVATAR | ImageType.BACKGROUND,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: 'jpeg|png|jpg|webp|bmp|heic',
				})
				.addMaxSizeValidator({
					maxSize: 1024 * 1024 * 5,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
		@Req() req: Request,
	) {
		const userId = (req.user as any).id;
		try {
			const { url, publicId } = await this.uploadService.uploadUserImage(file, userId, type);
			const data = await this.userService.update(userId, {
				[type === ImageType.AVATAR ? 'avatar' : 'background']: url,
				[type === ImageType.AVATAR ? 'avatarPublicId' : 'backgroundPublicId']: publicId,
			});
			return {
				success: true,
				message: `${type} uploaded successfully!`,
				data: data,
			};
		} catch (error) {
			throw new BadRequestException(`Failed to upload ${type}, or type is invalid`);
		}
	}

	// New protected routes to test RBAC
	// These routes' return values do not follow the ResponseEntity interface
	@UseGuards(RolesGuard)
	@Roles(Role.ADMIN)
	@Version('1')
	@Get('admin-only')
	@ApiOperation({ summary: 'Chỉ Admin được phép truy cập' })
	@ApiResponse({ status: 200, description: 'Truy cập thành công với quyền admin' })
	adminOnlyRoute() {
		return { message: 'This route is accessible to admin' };
	}

	@UseGuards(RolesGuard)
	@Roles(Role.MODERATOR, Role.ADMIN)
	@Version('1')
	@Get('moderator-and-admin')
	@ApiOperation({ summary: 'Moderator hoặc Admin được phép truy cập' })
	@ApiResponse({ status: 200, description: 'Truy cập thành công với quyền moderator hoặc admin' })
	moderatorAndAdminRoute() {
		return { message: 'This route is accessible to moderators and admin' };
	}

	// Contact management endpoints
	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Post('add-email')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Add new email to user account' })
	@ApiResponse({ status: 200, description: 'Email added successfully' })
	async addEmail(@Req() req: Request, @Body() dto: AddContactDto) {
		const userId = (req.user as any).id;
		if (!dto.otp) {
			return {
				success: false,
				message: 'OTP is required',
			};
		}
		if (dto.otpType !== 'add-email') {
			return {
				success: false,
				message: 'OTP type không hợp lệ',
			};
		}
		const checkOtp = await this.verificationService.otpVerify(dto.contact, dto.otp, dto.otpType);

		if (!checkOtp) {
			return {
				success: false,
				message: 'OTP không hợp lệ',
			};
		}
		await this.verificationService.deleteOtp(dto.contact, dto.otp, dto.otpType);
		const user = await this.userService.addEmail(userId, dto.contact);
		return {
			success: true,
			message: 'Email added successfully',
			data: {
				emails: user.emails,
			},
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Delete('remove-email')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remove email from user account' })
	@ApiResponse({ status: 200, description: 'Email removed successfully' })
	async removeEmail(@Req() req: Request, @Body() dto: RemoveContactDto) {
		const userId = (req.user as any).id;
		try {
			const user = await this.userService.removeEmail(userId, dto.contact, dto.password);
			return {
				success: true,
				message: 'Email removed successfully',
				data: {
					emails: user.emails,
				},
			};
		} catch (error) {
			return {
				success: false,
				message: 'Failed to remove email, check again relevant information',
			};
		}
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Post('add-phone')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Add new phone number to user account' })
	@ApiResponse({ status: 200, description: 'Phone number added successfully' })
	async addPhoneNumber(@Req() req: Request, @Body() dto: AddContactDto) {
		const userId = (req.user as any).id;
		const user = await this.userService.addPhoneNumber(userId, dto.contact);
		return {
			success: true,
			message: 'Phone number added successfully',
			data: {
				phoneNumbers: user.phoneNumbers,
			},
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Delete('remove-phone')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remove phone number from user account' })
	@ApiResponse({ status: 200, description: 'Phone number removed successfully' })
	async removePhoneNumber(@Req() req: Request, @Body() dto: RemoveContactDto) {
		const userId = (req.user as any).id;
		const user = await this.userService.removePhoneNumber(userId, dto.contact);
		return {
			success: true,
			message: 'Phone number removed successfully',
			data: {
				phoneNumbers: user.phoneNumbers,
			},
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Delete('remove-contact')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Remove contact from user account' })
	@ApiResponse({ status: 200, description: 'Contact removed successfully' })
	async removeContact(@Req() req: Request, @Body() dto: RemoveContactDto) {
		const userId = (req.user as any).id;
		const user = await this.userService.removeContact(userId, dto.contact, dto.password);

		return {
			success: true,
			message: 'Contact removed successfully',
			data: {
				emails: user.emails,
				phoneNumbers: user.phoneNumbers,
			},
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Post('add-contact')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Add contact to user account' })
	@ApiResponse({ status: 200, description: 'Contact added successfully' })
	async addContact(@Req() req: Request, @Body() dto: AddContactDto) {
		const userId = (req.user as any).id;
		if (!dto.otp) {
			return {
				success: false,
				message: 'OTP is required',
			};
		}
		if (isEmailOrPhone(dto.contact) === 'email') {
			const checkOtp = await this.verificationService.otpVerify(dto.contact, dto.otp, 'add-email');

			if (!checkOtp) {
				return {
					success: false,
					message: 'OTP không hợp lệ',
				};
			}
			await this.verificationService.deleteOtp(dto.contact, dto.otp, 'add-email');
			const user = await this.userService.addEmail(userId, dto.contact);
			return {
				success: true,
				message: 'Email added successfully',
				data: {
					emails: user.emails,
				},
			};
		}

		if (isEmailOrPhone(dto.contact) === 'phone') {
			return {
				success: false,
				message: 'Phone number added successfully',
			};
		}
		return {
			success: false,
			message: 'Invalid contact',
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Get('info/:id')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get user by id' })
	@ApiResponse({ status: 200, description: 'User retrieved successfully' })
	async getInfo(@Param('id') id: string) {
		const user = await this.userService.getUserById(id);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return {
			success: true,
			message: 'User retrieved successfully',
			data: user,
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Get('me')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
	async getMe(@Req() req: Request) {
		const userId = (req.user as any).id;
		const user = await this.userService.getUserById(userId);

		if (!user) {
			return {
				success: false,
				message: 'User not found',
			};
		}

		return {
			success: true,
			message: 'User profile retrieved successfully',
			data: user,
		};
	}

	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Put('me')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
	async updateMe(@Req() req: Request, @Body() dto: UpdateUserDto) {
		const userId = (req.user as any).id;
		try {
			const user = await this.userService.update(userId, dto);
			return {
				success: true,
				message: 'User profile updated successfully',
				data: user,
			};
		} catch (error) {
			throw new BadRequestException('Failed to update user profile');
		}
	}
	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Get('all-users')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: 'All users retrieved successfully' })
	async getAllUsers() {
		try {
			const users = await this.userService.getAllUsers();
			return {
				success: true,
				message: 'All users retrieved successfully',
				data: users,
			};
		} catch (error) {
			throw new BadRequestException('Failed to get all users');
		}
	}
	@UseGuards(JwtAuthGuard)
	@Version('1')
	@Put('change-password')
	@Response()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Change user password' })
	@ApiResponse({ status: 200, description: 'Password changed successfully' })
	async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
		const userId = (req.user as any).id;
		try {
			const user = await this.userService.updatePassword(userId, dto.newPassword);
			return {
				success: true,
				message: 'Password changed successfully',
			};
		} catch (error) {
			throw new ConflictException('Failed to change password');
		}
	}
}
