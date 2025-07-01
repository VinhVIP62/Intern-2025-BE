import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../entities/notification.schema';
import { NotificationType, ReferenceModel } from '../entities/notification.enum';

@Injectable()
export class NotificationService {
	constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

	async createNotification(data: {
		recipient: string;
		sender: string;
		type: NotificationType;
		title: string;
		message: string;
		referenceId?: string;
		referenceModel?: ReferenceModel;
	}) {
		const notification = new this.notificationModel(data);
		return await notification.save();
	}
}
