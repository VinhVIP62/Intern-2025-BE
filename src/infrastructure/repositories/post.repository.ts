import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '@domain/entities/post.entity';
import { IPostRepository } from '@src/domain/interfaces/repositories/post.repository.interface';
import { PostType } from '@domain/enums/event.enum';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectModel('Post')
    private readonly postModel: Model<Post>,
  ) {}

  async findById(id: string): Promise<Post | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Post>): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, data: Partial<Post>): Promise<Post | null> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async exists(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async findByEvent(eventId: string): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async findByGroup(groupId: string): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async findByType(type: PostType): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async findByHashtag(hashtag: string): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async findByTaggedUser(userId: string): Promise<Post[]> {
    throw new Error('Method not implemented.');
  }

  async addLike(postId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async removeLike(postId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async incrementCommentCount(postId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async decrementCommentCount(postId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async incrementShareCount(postId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async decrementShareCount(postId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
