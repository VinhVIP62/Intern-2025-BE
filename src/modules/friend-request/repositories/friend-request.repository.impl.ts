import { Injectable } from '@nestjs/common';
import { IFriendRequestRepository } from './friend-request.repository';

@Injectable()
export class FriendRequestRepositoryImpl implements IFriendRequestRepository {}
