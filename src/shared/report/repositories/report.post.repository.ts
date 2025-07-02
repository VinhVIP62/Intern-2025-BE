import { Injectable } from '@nestjs/common';
import { Report } from '../entities/report.post.schema';

@Injectable()
export abstract class IReportRepository {
	abstract create(report: Partial<Report>): Promise<Report>;
	abstract exists(reporterId: string, targetId: string, targetType: string): Promise<boolean>;
}
