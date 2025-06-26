import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IUserRepositoryToken } from '../repositories/user.repository';
import { User } from '../entities/user.schema';
import { FileHostService } from 'src/shared/modules/file-host/provider/file-host.service';

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

	async update(id: string, data: Partial<User> & { avatar?: Express.Multer.File }): Promise<User> {
		if (data.avatar) data.avatarUrl = await this.fileHostService.image2Url(data.avatar);
		const updatedUser = this.userRepository.update(id, { ...data, hasFinishedSetup: true });
		return updatedUser;
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
}
