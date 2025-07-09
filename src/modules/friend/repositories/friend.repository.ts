import { Injectable } from '@nestjs/common';
import { FriendReq } from '../entities/friend-req.schema';

@Injectable()
export abstract class IFriendRepository {
	abstract create(data: Partial<FriendReq>): Promise<FriendReq>;

	abstract find(query: any): Promise<FriendReq | null>;

	abstract findAll(query: any): Promise<FriendReq[]>;

	abstract update(
		idUser: string,
		idFriend: string,
		data: Partial<FriendReq>,
	): Promise<FriendReq | null>;

	abstract delete(idUser: string, idFriend: string): Promise<void>;
}
