export class Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Achievement>) {
    Object.assign(this, partial);
  }
}
