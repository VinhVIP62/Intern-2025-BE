import { IsString } from 'class-validator';

export class LogoutResponse {
	@IsString()
	message: string;
}
