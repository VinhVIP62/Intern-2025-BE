import { Injectable } from '@nestjs/common';
import { ISportRepository } from './sport.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Sport } from '../entities/sport.schema';

@Injectable()
export class SportRepositoryImpl implements ISportRepository {
	constructor(@InjectModel(Sport.name) private readonly sportModel: Model<Sport>) {}

	async findAll(): Promise<Sport[]> {
		return this.sportModel.find().exec();
	}
}
