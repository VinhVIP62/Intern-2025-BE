import { IsArray } from 'class-validator';

export class ListUserIdDto {
	@IsArray()
	userIds: string[];
	constructor(userIds: string[]) {
		this.userIds = userIds;
	}
}
