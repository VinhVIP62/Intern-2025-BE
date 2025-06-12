import { SportType, EventStatus } from '../enums/event.enum';

export class Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  organizer: string;
  sport: SportType;
  startDate: Date;
  endDate: Date;
  location: {
    name: string;
    address: string;
    city: string;
    district: string;
  };
  minParticipants: number;
  maxParticipants: number;
  participants: string[];
  status: EventStatus;
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Event>) {
    Object.assign(this, partial);
  }
}
