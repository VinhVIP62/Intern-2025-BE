import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FriendRequest } from '@domain/entities/friend-request.entity';
import { IFriendRequestRepository } from '@src/domain/interfaces/repositories/friend-request.repository.interface';

@Injectable()
export class FriendRequestRepository implements IFriendRequestRepository {
  constructor(
    @InjectModel('FriendRequest')
    private readonly friendRequestModel: Model<FriendRequest>,
  ) {}

  async findById(id: string): Promise<FriendRequest | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<FriendRequest[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<FriendRequest>): Promise<FriendRequest> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<FriendRequest>): Promise<FriendRequest | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findBySender(senderId: string): Promise<FriendRequest[]> {
    throw new Error('Method not implemented.');
  }

  async findByRecipient(recipientId: string): Promise<FriendRequest[]> {
    throw new Error('Method not implemented.');
  }

  async findByStatus(status: string): Promise<FriendRequest[]> {
    throw new Error('Method not implemented.');
  }

  async findBySenderAndRecipient(
    senderId: string,
    recipientId: string,
  ): Promise<FriendRequest | null> {
    throw new Error('Method not implemented.');
  }

  async updateStatus(requestId: string, status: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async deleteBySenderAndRecipient(senderId: string, recipientId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
