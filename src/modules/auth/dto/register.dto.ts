import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class RegisterDto extends CreateUserDto {
	@ApiProperty({ description: 'Phone number or email', example: '0123456789 or abc@gmail.com' })
	@IsNotEmpty({ message: 'Phone number or email is required' })
	accInput: string;
}
