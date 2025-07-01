import { Profile } from '../entities/profile.schema';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileMapper {
	static toResponse(profile: Profile, message: string): ProfileResponseDto {
		return {
			message: message,
			firstName: profile.firstName,
			lastName: profile.lastName,
			nickname: profile.nickname,
			avatarUrl: profile.avatarUrl ? profile.avatarUrl : null,
			coverUrl: profile.coverUrl ? profile.coverUrl : null,
			bio: profile.bio ? profile.bio : null,
			birthday: profile.birthday.toISOString(),
			gender: profile.gender,
			address: profile.address,
			sportInterests: profile.sportInterests,
			sportLevel: profile.sportLevel,
		};
	}
}
