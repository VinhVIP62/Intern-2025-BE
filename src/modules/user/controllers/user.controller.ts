import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	UploadedFile,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseProfileDto, SetupUserDto, UpdateUserDto } from '../dto';
import { UserService } from '../providers/user.service';
import { Sub } from '@modules/auth/types';
import { EntityNotFound } from '@common/exceptions';
import { User } from '../entities/user.schema';
import { plainToInstance } from 'class-transformer';
import { FileHostService } from 'src/shared/modules/file-host/provider/file-host.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseAuthDto } from '@modules/auth/dto';
import { TokenService } from '@modules/auth/providers/token.service';

@Controller()
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly fileHostService: FileHostService,
	) {}

	@Get('profile')
	@Version('1')
	async profile(@Req() request: Request): Promise<ResponseProfileDto> {
		const id = (request.user! as Sub).id;
		const profile = await this.userService.findOneById(id);
		if (!profile) throw new EntityNotFound(User);
		return plainToInstance(ResponseProfileDto, profile);
	}

	@Post('setup')
	@Version('1')
	@UseInterceptors(FileInterceptor('avatar'))
	async setupProfile(
		@Req() request: Request,
		@Body() body: SetupUserDto,
		@UploadedFile() avatar: Express.Multer.File,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const sub = request.user! as Sub;
		const id = sub.id;
		const finishedProfile = await this.userService.update(id, { ...body, avatar });
		const tokens = await this.tokenService.generateTokens({ sub: { ...sub, ...finishedProfile } });
		return { ...plainToInstance(ResponseProfileDto, finishedProfile), ...tokens };
	}

	@Post('update')
	@Version('1')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateProfile(
		@Req() request: Request,
		@Body() body: UpdateUserDto,
		@UploadedFile() avatar: Express.Multer.File,
	): Promise<ResponseProfileDto> {
		const sub = request.user! as Sub;
		const id = sub.id;
		const updateData: Partial<User> = {};
		// avatar (optional as I don't know how to use class-validator with)
		if (avatar) updateData.avatarUrl = await this.fileHostService.image2Url(avatar);
		const updatedProfile = await this.userService.update(id, { ...updateData, ...body });
		const tokens = await this.tokenService.generateTokens({ sub: { ...sub, ...updatedProfile } });
		return { ...plainToInstance(ResponseProfileDto, updatedProfile), ...tokens };
	}

	@Delete('deactivate')
	@Version('1')
	async deactivateProfile() {}
}
