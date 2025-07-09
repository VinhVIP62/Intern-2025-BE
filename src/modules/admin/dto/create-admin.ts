import { CreateUserDto } from '@modules/user/dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto extends CreateUserDto {
	@ApiProperty({
		description: 'Create admin with role admin',
	})
	roles: ['admin'];
}
