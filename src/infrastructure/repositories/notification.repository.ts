import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '@domain/entities/notification.entity';
import { INotificationRepository } from '@src/domain/interfaces/repositories/notification.repository.interface';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByRecipient(recipientId: string): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async findBySender(senderId: string): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async findByType(type: string): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async findByReference(referenceId: string, referenceModel: string): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async markAllAsRead(recipientId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async setActive(notificationId: string, isActive: boolean): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async deleteOldNotifications(days: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
