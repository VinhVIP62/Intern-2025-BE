import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';

@Injectable()
export class TaggedUserMapper {
	constructor(private readonly profileRepo: IProfileRepository) {}

	async getTaggedUserToResponse(userId: string) {
		const profile = await this.profileRepo.findById(userId);
		return {
			userId: userId,
			firstName: profile.firstName,
			lastName: profile.lastName,
		};
	}
}
