import { User } from '../../entities/user.entity';
import { IBaseRepository } from './base.repository.interface';
import { SportType } from '../../enums/event.enum';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findBySport(sport: SportType): Promise<User[]>;
  findFriends(userId: string): Promise<User[]>;
  findFollowers(userId: string): Promise<User[]>;
  findFollowing(userId: string): Promise<User[]>;
  findJoinedGroups(userId: string): Promise<User[]>;
  updatePassword(userId: string, newPassword: string): Promise<boolean>;
  updateRefToken(userId: string, refToken: string | null): Promise<boolean>;
  addFriend(userId: string, friendId: string): Promise<boolean>;
  removeFriend(userId: string, friendId: string): Promise<boolean>;
  addFollower(userId: string, followerId: string): Promise<boolean>;
  removeFollower(userId: string, followerId: string): Promise<boolean>;
  addFollowing(userId: string, followingId: string): Promise<boolean>;
  removeFollowing(userId: string, followingId: string): Promise<boolean>;
  joinGroup(userId: string, groupId: string): Promise<boolean>;
  leaveGroup(userId: string, groupId: string): Promise<boolean>;
}
