import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class RejectMemberDto {
	@IsString()
	eventId: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	memberIds: string[];
}
