import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement } from '../entities/achievement.schema';
import { IAchievementRepository } from './achievement.repository';

@Injectable()
export class AchievementRepositoryImpl implements IAchievementRepository {
	constructor(@InjectModel('Achievement') private readonly achievementModel: Model<Achievement>) {}

	async findAllAchievements(): Promise<Achievement[]> {
		return this.achievementModel.find().lean();
	}
}
