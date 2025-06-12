import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAchievement } from '@domain/entities/user-achievement.entity';
import { IUserAchievementRepository } from '@src/domain/interfaces/repositories/user-achievement.repository.interface';

@Injectable()
export class UserAchievementRepository implements IUserAchievementRepository {
  constructor(
    @InjectModel('UserAchievement')
    private readonly userAchievementModel: Model<UserAchievement>,
  ) {}

  async findById(id: string): Promise<UserAchievement | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<UserAchievement[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<UserAchievement>): Promise<UserAchievement> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<UserAchievement>): Promise<UserAchievement | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByUser(userId: string): Promise<UserAchievement[]> {
    throw new Error('Method not implemented.');
  }

  async findByAchievement(achievementId: string): Promise<UserAchievement[]> {
    throw new Error('Method not implemented.');
  }

  async findByUserAndAchievement(
    userId: string,
    achievementId: string,
  ): Promise<UserAchievement | null> {
    throw new Error('Method not implemented.');
  }

  async updateProgress(userId: string, achievementId: string, progress: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findUnlockedByUser(userId: string): Promise<UserAchievement[]> {
    throw new Error('Method not implemented.');
  }

  async findLockedByUser(userId: string): Promise<UserAchievement[]> {
    throw new Error('Method not implemented.');
  }
}
