import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AcceptMemberDto {
	@IsString()
	eventId: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	memberIds: string[];
}
