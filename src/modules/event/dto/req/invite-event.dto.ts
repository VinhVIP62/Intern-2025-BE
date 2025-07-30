import { Expose } from 'class-transformer';

import { IsValidId } from '@common/decorators/class-validator';

export class InviteEventDto {
	@Expose()
	@IsValidId()
	toUserId!: string;
}
