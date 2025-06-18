import { Injectable } from '@nestjs/common';
import { IAchievementRepository } from './achievement.repository';

@Injectable()
export class AchievementRepositoryImpl implements IAchievementRepository {}
