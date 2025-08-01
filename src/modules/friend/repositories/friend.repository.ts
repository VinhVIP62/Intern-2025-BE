import { Injectable } from '@nestjs/common';
import { FriendReq } from '../entities/friend-req.schema';
import { FriendPaginationDto } from '../dto/response/friend.Pagination.dto';
import { FriendDto } from '@modules/friend/dto/response/friend.dto';

@Injectable()
export abstract class IFriendRepository {
	abstract create(data: Partial<FriendReq>): Promise<FriendReq>;

	abstract find(query: any): Promise<FriendReq[]>;
	abstract findOne(query: any, isSender: boolean): Promise<FriendDto | null>;

	abstract findUserFriends(query: any, page: number, limit: number): Promise<FriendPaginationDto>;

	abstract findUserRequests(query: any, page: number, limit: number): Promise<FriendPaginationDto>;

	abstract update(
		idUser: string,
		idFriend: string,
		data: Partial<FriendReq>,
	): Promise<FriendDto | null>;

	abstract delete(idUser: string, idFriend: string): Promise<void>;
}
