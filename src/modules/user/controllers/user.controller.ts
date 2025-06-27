import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
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
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';

@Roles(Role.USER)
@Controller()
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly fileHostService: FileHostService,
	) {}

	@Roles()
	@Get('me')
	@Version('1')
	async profile(@Req() request: Request): Promise<ResponseProfileDto> {
		const id = (request.user! as Sub).id;
		const profile = await this.userService.findOneById(id);
		if (!profile) throw new EntityNotFound(User);
		return plainToInstance(ResponseProfileDto, profile);
	}

	@Roles()
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
		const finishedProfile = await this.userService.updateWithSetup(id, { ...body, avatar });
		// extract values of fields defined in Sub class to generate new tokens
		const newSub = plainToInstance(
			Sub,
			{ ...finishedProfile, id: finishedProfile._id.toString() },
			{
				excludeExtraneousValues: true,
			},
		);

		const tokens = await this.tokenService.generateTokens({ sub: newSub });
		return { ...plainToInstance(ResponseProfileDto, finishedProfile), ...tokens };
	}

	@Put('me')
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
		const newSub = plainToInstance(
			Sub,
			{ ...updatedProfile, id: updatedProfile._id.toString() },
			{
				excludeExtraneousValues: true,
			},
		);

		const tokens = await this.tokenService.generateTokens({ sub: newSub });
		return { ...plainToInstance(ResponseProfileDto, updatedProfile), ...tokens };
	}

	@Delete('deactivate')
	@Version('1')
	async deactivateProfile() {}
}
