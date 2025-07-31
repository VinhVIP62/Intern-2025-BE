// src/modules/user/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.schema';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { UpdateUserDto } from '../dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

@Injectable()
export abstract class IUserRepository {
	abstract create(data: Partial<User>): Promise<User>;
	abstract updateById(id: string, data: UpdateUserDto): Promise<User>;
	abstract updateAvatarById(id: string, dto: UpdateAvatarDto): Promise<User>;
	abstract changePasswordById(id: string, dto: UpdatePasswordDto): Promise<User>;
	abstract findByEmail(email: string): Promise<User | null>;
	abstract findManyByIds(userIds: string[]): Promise<User[]>;
	abstract findOneById(id: string): Promise<User>;
	abstract findByUsernames(usernames: string[]): Promise<User[]>;
}
