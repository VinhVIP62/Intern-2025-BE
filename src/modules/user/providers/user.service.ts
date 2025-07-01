import { Inject, Injectable } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';
import { FileHostService } from 'src/shared/modules/file-host/provider/file-host.service';

import { Role } from '@common/enums';

import { User } from '../entities';
import { IUserRepository, IUserRepositoryToken } from '../repositories/user.repository';

@Injectable()
export class UserService {
	constructor(
		@Inject(IUserRepositoryToken) private readonly userRepository: IUserRepository,
		private readonly fileHostService: FileHostService,
	) {}

	async create(data: Partial<User>): Promise<User> {
		const newUser = this.userRepository.create(data);
		return newUser;
	}

	async update(id: string, data: Partial<User> & { avatar?: MemoryStoredFile }): Promise<User> {
		if (data.avatar) data.avatarUrl = await this.fileHostService.image2Url(data.avatar);
		const updatedUser = this.userRepository.update(id, data);
		return updatedUser;
	}

	async updateWithSetup(
		id: string,
		data: Partial<User> & { avatar?: MemoryStoredFile },
	): Promise<User> {
		data.hasFinishedSetup = true;
		data.roles = [Role.USER];
		return this.update(id, data);
	}

	async findOneByUsername(username: string): Promise<User | null> {
		const foundUser = this.userRepository.findOneByUsername(username);
		return foundUser;
	}

	async findOneById(id: string): Promise<User | null> {
		const foundUser = this.userRepository.findOneById(id);
		return foundUser;
	}

	async findOneBy(options: Partial<User>): Promise<User | null> {
		return this.userRepository.findOneBy(options);
	}

	async find(options: Partial<User>): Promise<User[]> {
		return this.userRepository.find(options);
	}

	async softDelete(id: string, deletedBy: string | null = null): Promise<User> {
		return this.userRepository.softDelete(id, deletedBy);
	}

	async restore(id: string): Promise<User> {
		return this.userRepository.restore(id);
	}

	async findLoginable(options: Partial<User>): Promise<User | null> {
		return this.userRepository.findOneLoginable(options);
	}

	async findLoginableAndRestore(options: Partial<User>): Promise<User | null> {
		const user = await this.userRepository.findOneLoginable(options);
		return user ? this.userRepository.restore(user.id) : null;
	}

	async findAny(options: Partial<User>): Promise<User[]> {
		return this.userRepository.find(options, { doNotUseRepoOptions: true });
	}
}
