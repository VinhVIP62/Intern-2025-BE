import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Types } from 'mongoose';
import { ResponseNotificationDto } from '../dto/response-notification.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NotificationService {
	constructor(private readonly repository: INotificationRepository) {}

	async create(dto: CreateNotificationDto): Promise<ResponseNotificationDto> {
		const created = await this.repository.create({
			actor: new Types.ObjectId(dto.actor),
			receiver: new Types.ObjectId(dto.receiver),
			type: dto.type,
			title: dto.title || '',
			content: dto.content || '',
			metaRef: dto.metaRef ? new Types.ObjectId(dto.metaRef) : undefined,
			metaModel: dto.metaModel || undefined,
		});

		return plainToInstance(ResponseNotificationDto, created, {
			excludeExtraneousValues: true,
		});
	}

	async getUserNotifications(
		userId: string,
		page: number,
		limit: number,
	): Promise<{
		items: ResponseNotificationDto[];
		meta: { total: number; page: number; limit: number };
	}> {
		const { items, total } = await this.repository.findByUser(userId, page, limit);

		const data = items.map(item => {
			const plain = plainToInstance(ResponseNotificationDto, item, {
				excludeExtraneousValues: true,
			});
			return plain;
		});

		return {
			items: data,
			meta: { total, page, limit },
		};
	}

	markAsRead(id: string) {
		return this.repository.markAsRead(id);
	}

	delete(id: string) {
		return this.repository.delete(id);
	}
}
