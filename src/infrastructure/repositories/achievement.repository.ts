import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement } from '@domain/entities/achievement.entity';
import { IAchievementRepository } from '@src/domain/interfaces/repositories/achievement.repository.interface';

@Injectable()
export class AchievementRepository implements IAchievementRepository {
  constructor(
    @InjectModel('Achievement')
    private readonly achievementModel: Model<Achievement>,
  ) {}

  async findById(id: string): Promise<Achievement | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Achievement[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Achievement>): Promise<Achievement> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<Achievement>): Promise<Achievement | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByName(name: string): Promise<Achievement | null> {
    throw new Error('Method not implemented.');
  }

  async findByCriteria(criteria: string): Promise<Achievement[]> {
    throw new Error('Method not implemented.');
  }

  async setActive(achievementId: string, isActive: boolean): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findActive(): Promise<Achievement[]> {
    throw new Error('Method not implemented.');
  }
}
