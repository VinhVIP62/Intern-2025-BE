import { IsArray, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class FriendDto {
	@IsNotEmpty()
	@IsString()
	id: string;

	@IsNotEmpty()
	@IsString()
	sender: string;

	@IsNotEmpty()
	@IsString()
	receiver: string;

	@IsNotEmpty()
	@IsString()
	status: string;

	@IsNotEmpty()
	@IsDate()
	createdAt: Date;

	@IsNotEmpty()
	userInfo: {
		id: string;
		fullName: string;
		avatar: string;
		description: string;
	};
}
