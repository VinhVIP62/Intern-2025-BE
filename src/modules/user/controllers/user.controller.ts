import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Post,
	Put,
	Req,
	Version,
	forwardRef,
} from '@nestjs/common';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { Roles } from '@common/decorators';
import { Role } from '@common/enums';
import { EntityNotFound } from '@common/exceptions';
import { AuthenticatedRequest } from '@common/types/data';
import { plainToInstanceStrict } from '@common/utils';

import { TokenService } from '@modules/auth';
import { ResponseAuthDto } from '@modules/auth/dto';
import { createPayload, tokensSchema } from '@modules/auth/types';

import { ResponseProfileDto, SetupGoogleUserDto, SetupUserDto, UpdateUserDto } from '../dto';
import { User } from '../entities';
import { UserService } from '../providers';

@Roles(Role.USER)
@Controller()
export class UserController {
	constructor(
		private readonly userService: UserService,
		@Inject(forwardRef(() => TokenService)) private readonly tokenService: TokenService,
	) {}

	@Version('1')
	@Get('me')
	@Roles()
	async profile(@Req() request: AuthenticatedRequest): Promise<ResponseProfileDto> {
		const profile = await this.userService.findOneById(request.user.id);
		if (!profile) throw new EntityNotFound(User);
		return plainToInstanceStrict(ResponseProfileDto, profile);
	}

	@Version('1')
	@Post('setup')
	@FormDataRequest({ storage: MemoryStoredFile })
	@Roles()
	async setupProfile(
		@Req() request: AuthenticatedRequest,
		@Body() body: SetupUserDto,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const finishedProfile = await this.userService.updateWithSetup(request.user.id, body);
		const tokens = await this.tokenService.generateTokens(createPayload(finishedProfile), true);
		return {
			...plainToInstanceStrict(ResponseProfileDto, finishedProfile),
			...tokensSchema.parse(tokens),
		};
	}

	@Version('1')
	@Post('setup/google')
	@FormDataRequest({ storage: MemoryStoredFile })
	@Roles()
	async setupProfileForGoogle(
		@Req() request: AuthenticatedRequest,
		@Body() body: SetupGoogleUserDto,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const finishedProfile = await this.userService.updateWithSetup(request.user.id, body);
		const tokens = await this.tokenService.generateTokens(createPayload(finishedProfile), true);
		return {
			...plainToInstanceStrict(ResponseProfileDto, finishedProfile),
			...tokensSchema.parse(tokens),
		};
	}

	@Version('1')
	@Put('me')
	@FormDataRequest({ storage: MemoryStoredFile })
	async updateProfile(
		@Req() request: AuthenticatedRequest,
		@Body() body: UpdateUserDto,
	): Promise<ResponseProfileDto & ResponseAuthDto> {
		const updatedProfile = await this.userService.update(request.user.id, body);
		const tokens = await this.tokenService.generateTokens(createPayload(updatedProfile), true);
		return {
			...plainToInstanceStrict(ResponseProfileDto, updatedProfile),
			...tokensSchema.parse(tokens),
		};
	}

	@Version('1')
	@Delete('deactivate')
	@Roles()
	async deactivateProfile(@Req() request: AuthenticatedRequest): Promise<ResponseProfileDto> {
		const deletedProfile = await this.userService.softDelete(request.user.id, request.user.id);
		return plainToInstanceStrict(ResponseProfileDto, deletedProfile);
	}
}
