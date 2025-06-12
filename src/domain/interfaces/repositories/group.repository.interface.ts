import { Group } from '../../entities/group.entity';
import { IBaseRepository } from './base.repository.interface';
import { SportType } from '../../enums/event.enum';

export interface IGroupRepository extends IBaseRepository<Group> {
  findByName(name: string): Promise<Group[]>;
  findBySport(sport: SportType): Promise<Group[]>;
  findByLocation(city: string, district?: string): Promise<Group[]>;
  findByAdmin(adminId: string): Promise<Group[]>;
  findByMember(memberId: string): Promise<Group[]>;
  addAdmin(groupId: string, userId: string): Promise<boolean>;
  removeAdmin(groupId: string, userId: string): Promise<boolean>;
  addMember(groupId: string, userId: string): Promise<boolean>;
  removeMember(groupId: string, userId: string): Promise<boolean>;
  addToWaitingList(groupId: string, userId: string): Promise<boolean>;
  removeFromWaitingList(groupId: string, userId: string): Promise<boolean>;
  incrementMemberCount(groupId: string): Promise<boolean>;
  decrementMemberCount(groupId: string): Promise<boolean>;
}
