import { Injectable } from '@nestjs/common';
import { INotificationRepository } from './notification.repository';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {}
