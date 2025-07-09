// src/modules/user/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.schema';

@Injectable()
export abstract class IUserRepository {
	abstract create(data: Partial<User>): Promise<User>;
	abstract update(id: string, data: Partial<User>): Promise<User>;
	abstract findOneByUsername(username: string): Promise<User | null>;
	abstract findOneById(id: string): Promise<User | null>;
	abstract findByEmail(email: string): Promise<User | null>;
	abstract findByEmailOrNumber(emailOrNumber: string): Promise<User | null>;
	abstract addEmail(userId: string, email: string): Promise<User>;
	abstract removeEmail(userId: string, email: string, password: string): Promise<User>;
	abstract addPhoneNumber(userId: string, phoneNumber: string): Promise<User>;
	abstract removePhoneNumber(userId: string, phoneNumber: string): Promise<User>;
	abstract updatePassword(userId: string, password: string);
	abstract getUserById(userId: string): Promise<User | null>;
	abstract getAllUsers(): Promise<User[]>;
	abstract checkPassword(userId: string, password: string): Promise<boolean>;
	abstract search(query: any): Promise<User[]>;
}
