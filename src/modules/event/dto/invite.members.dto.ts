import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class InviteMemberDto {
	@IsString()
	eventId: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	memberIds: string[];
}
