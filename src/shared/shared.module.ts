import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { ProfileRepositoryImpl } from '@modules/user/repositories/profile.repository.impl';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { UserRepositoryImpl } from '@modules/user/repositories/user.repository.impl';
import { Module } from '@nestjs/common';

@Module({
	providers: [
		{
			provide: IUserRepository,
			useClass: UserRepositoryImpl,
		},
		{
			provide: IProfileRepository,
			useClass: ProfileRepositoryImpl,
		},
	],
	exports: [],
})
export class SharedModule {}
