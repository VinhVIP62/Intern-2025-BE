import { Event } from '../../entities/event.entity';
import { IBaseRepository } from './base.repository.interface';
import { SportType, EventStatus } from '../../enums/event.enum';

export interface IEventRepository extends IBaseRepository<Event> {
  findByOrganizer(organizerId: string): Promise<Event[]>;
  findBySport(sport: SportType): Promise<Event[]>;
  findByStatus(status: EventStatus): Promise<Event[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  findByLocation(city: string, district?: string): Promise<Event[]>;
  addParticipant(eventId: string, userId: string): Promise<boolean>;
  removeParticipant(eventId: string, userId: string): Promise<boolean>;
  updateStatus(eventId: string, status: EventStatus): Promise<boolean>;
  incrementParticipantCount(eventId: string): Promise<boolean>;
  decrementParticipantCount(eventId: string): Promise<boolean>;
}
