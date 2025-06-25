import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Profile } from '../entities/profile.schema';

@Injectable()
export abstract class IProfileRepository {
	abstract create(request: CreateProfileDto): Promise<Profile>;
	abstract findById(userId: string): Promise<Profile>;
	abstract update(request: UpdateProfileDto): Promise<Profile>;
	abstract delete(userId: string): Promise<boolean>;
}
