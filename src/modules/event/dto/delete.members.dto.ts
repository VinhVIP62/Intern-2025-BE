import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteMemberDto {
	@IsString()
	eventId: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	memberIds: string[];
}
