export class Notification {
  id: string;
  recipient: string;
  sender: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceModel?: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}
