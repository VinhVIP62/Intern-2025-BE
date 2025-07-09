import { FriendRepositoryImpl } from './friend.repository.impl';
import { IFriendRepository } from './friend.repository';

export const friendRepository = {
	provide: IFriendRepository,
	useClass: FriendRepositoryImpl,
};
