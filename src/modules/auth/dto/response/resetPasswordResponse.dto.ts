import { IsString } from 'class-validator';

export class ResetPasswordResponse {
	@IsString()
	message: string;
}
