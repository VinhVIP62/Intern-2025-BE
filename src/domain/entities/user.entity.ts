import { UserRole, ActivityLevel } from '../enums/user.enum';
import { SportType } from '../enums/event.enum';

export class User {
  id: string;
  email: string;
  password: string;
  refToken?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  dateOfBirth?: Date;
  phone?: string;
  location?: {
    city: string;
    district: string;
    address: string;
  };
  favoritesSports: SportType[];
  skillLevels: Map<SportType, ActivityLevel>;
  friends: string[];
  following: string[];
  followers: string[];
  joinedGroups: string[];
  isActive: boolean;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
