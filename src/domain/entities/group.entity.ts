import { SportType } from '../enums/event.enum';

export class Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  admins: string[];
  members: string[];
  waitingList: string[];
  sport: SportType;
  location?: {
    city: string;
    district: string;
  };
  isPrivate: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Group>) {
    Object.assign(this, partial);
  }
}
