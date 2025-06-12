import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '@domain/entities/event.entity';
import { IEventRepository } from '@src/domain/interfaces/repositories/event.repository.interface';
import { SportType, EventStatus } from '@domain/enums/event.enum';

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(
    @InjectModel('Event')
    private readonly eventModel: Model<Event>,
  ) {}

  async findById(id: string): Promise<Event | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Event>): Promise<Event> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<Event>): Promise<Event | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async findBySport(sport: SportType): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async findByStatus(status: EventStatus): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async findByLocation(city: string, district?: string): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }

  async addParticipant(eventId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeParticipant(eventId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async updateStatus(eventId: string, status: EventStatus): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async incrementParticipantCount(eventId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async decrementParticipantCount(eventId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
