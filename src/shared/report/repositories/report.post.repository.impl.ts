import { Injectable } from '@nestjs/common';
import { IReportRepository } from './report.post.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Report } from '../entities/report.post.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReportRepositoryImpl implements IReportRepository {
	constructor(@InjectModel(Report.name) private reportModel: Model<Report>) {}

	async create(report: Partial<Report>) {
		return this.reportModel.create(report);
	}

	async exists(reporterId: string, targetId: string, targetType: string): Promise<boolean> {
		return !!(await this.reportModel.findOne({ reporterId, targetId, targetType }));
	}
}
