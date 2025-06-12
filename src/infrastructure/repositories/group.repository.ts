import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '@domain/entities/group.entity';
import { IGroupRepository } from '@src/domain/interfaces/repositories/group.repository.interface';
import { SportType } from '@domain/enums/event.enum';

@Injectable()
export class GroupRepository implements IGroupRepository {
  constructor(
    @InjectModel('Group')
    private readonly groupModel: Model<Group>,
  ) {}

  async findById(id: string): Promise<Group | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Group>): Promise<Group> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<Group>): Promise<Group | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByName(name: string): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }

  async findBySport(sport: SportType): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }

  async findByLocation(city: string, district?: string): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }

  async findByAdmin(adminId: string): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }

  async findByMember(memberId: string): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }

  async addAdmin(groupId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeAdmin(groupId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addMember(groupId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeMember(groupId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addToWaitingList(groupId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeFromWaitingList(groupId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async incrementMemberCount(groupId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async decrementMemberCount(groupId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
