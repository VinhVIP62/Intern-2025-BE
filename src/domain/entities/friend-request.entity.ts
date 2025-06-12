export class FriendRequest {
  id: string;
  sender: string;
  recipient: string;
  status: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FriendRequest>) {
    Object.assign(this, partial);
  }
}
