import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@src/domain/interfaces/repositories/user.repository.interface';
import { SportType } from '@domain/enums/event.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<User>): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async findBySport(sport: SportType): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  async findFriends(userId: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  async findFollowers(userId: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  async findFollowing(userId: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  async findJoinedGroups(userId: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async updateRefToken(userId: string, refToken: string | null): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addFriend(userId: string, friendId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addFollower(userId: string, followerId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeFollower(userId: string, followerId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addFollowing(userId: string, followingId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeFollowing(userId: string, followingId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async joinGroup(userId: string, groupId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async leaveGroup(userId: string, groupId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
