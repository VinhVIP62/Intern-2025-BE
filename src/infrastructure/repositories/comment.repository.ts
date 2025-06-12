import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '@domain/entities/comment.entity';
import { ICommentRepository } from '@src/domain/interfaces/repositories/comment.repository.interface';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<Comment>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Comment[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<Comment>): Promise<Comment | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByPost(postId: string): Promise<Comment[]> {
    throw new Error('Method not implemented.');
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    throw new Error('Method not implemented.');
  }

  async findByParent(parentId: string): Promise<Comment[]> {
    throw new Error('Method not implemented.');
  }

  async addLike(commentId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeLike(commentId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async incrementReplyCount(commentId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async decrementReplyCount(commentId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async setActive(commentId: string, isActive: boolean): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
