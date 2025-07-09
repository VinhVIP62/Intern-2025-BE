// src/modules/user/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.schema';
import { IUserRepository } from './user.repository';
import { EntityNotFound } from '@common/exceptions/EntityNotFound.error';
import { aw } from '@upstash/redis/zmscore-DzNHSWxc';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { isEmailOrPhone } from '@common/utils/check-email-or-phone';
import { isEmail, length } from 'class-validator';
import { response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async create(data: RegisterDto): Promise<User> {
		const methodCreate = isEmailOrPhone(data.account);
		if (methodCreate === 'email') {
			return new this.userModel({
				...data,
				emails: [data.account],
			}).save();
		}
		if (methodCreate === 'phone') {
			return new this.userModel({
				...data,
				phoneNumbers: [data.account],
			}).save();
		}
		throw new Error('Invalid account input type');
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const updatedUser = await this.userModel.findByIdAndUpdate(id, data, { new: true });
		if (updatedUser === null) throw new EntityNotFound(User);
		return updatedUser;
	}

	async findOneByUsername(username: string): Promise<User | null> {
		return await this.userModel.findOne({ username });
	}

	async findOneById(id: string): Promise<User | null> {
		return await this.userModel.findById(id);
	}
	async findByEmail(email: string): Promise<User | null> {
		return await this.userModel.findOne({
			email,
		});
	}
	// Search in arrays of emails and phone numbers
	async findByEmailOrNumber(emailOrNumber: string): Promise<User | null> {
		const methodCreate = isEmailOrPhone(emailOrNumber);
		if (methodCreate === 'email') {
			return await this.userModel.findOne({ emails: emailOrNumber });
		}
		if (methodCreate === 'phone') {
			return await this.userModel.findOne({ phoneNumbers: emailOrNumber });
		}
		throw new Error('Invalid account input type');
	}

	async addEmail(userId: string, email: string): Promise<User> {
		// Check if email already exists in any user's emails array
		const existingUserByEmails = await this.userModel.findOne({ emails: email });
		if (existingUserByEmails) {
			throw new Error(`Email "${email}" already exists in another account`);
		}

		// Get current user to check if this is their first email
		const currentUser = await this.userModel.findById(userId);
		if (!currentUser) throw new EntityNotFound(User);

		const updateData: any = { $addToSet: { emails: email } };

		const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });

		if (!updatedUser) throw new EntityNotFound(User);
		return updatedUser;
	}

	async removeEmail(userId: string, email: string, password: string): Promise<User> {
		const user = await this.userModel.findById(userId);
		if (!user) throw new EntityNotFound(User);

		// Prevent deletion of primary email
		if (user.emails?.length === 1) {
			throw new Error(
				'Cannot delete primary email. Please set another email as primary first, then delete this email.',
			);
		}

		// Check if email exists in user's emails array
		if (!user.emails || !user.emails.includes(email)) {
			throw new Error('Email does not exist in your account.');
		}

		// Regular email deletion (non-primary only)
		const updatedUser = await this.userModel.findByIdAndUpdate(
			userId,
			{ $pull: { emails: email } },
			{ new: true },
		);

		if (!updatedUser) throw new EntityNotFound(User);
		return updatedUser;
	}

	async addPhoneNumber(userId: string, phoneNumber: string): Promise<User> {
		// Check if phone number already exists in any user's phoneNumbers array
		const existingUserByPhoneNumbers = await this.userModel.findOne({ phoneNumbers: phoneNumber });
		if (existingUserByPhoneNumbers) {
			throw new Error(`Phone number "${phoneNumber}" already exists in another account`);
		}

		// Get current user to check if this is their first phone number
		const currentUser = await this.userModel.findById(userId);
		if (!currentUser) throw new EntityNotFound(User);

		const updateData: any = { $addToSet: { phoneNumbers: phoneNumber } };

		const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });

		if (!updatedUser) throw new EntityNotFound(User);
		return updatedUser;
	}

	async removePhoneNumber(userId: string, phoneNumber: string): Promise<User> {
		const user = await this.userModel.findById(userId);
		if (!user) throw new EntityNotFound(User);

		// Prevent deletion of primary phone number
		if (user.phoneNumbers?.length === 1) {
			throw new Error(
				'Cannot delete phone number. Please add another phone number first, then delete this phone number.',
			);
		}

		// Check if phone number exists in user's phoneNumbers array
		if (!user.phoneNumbers || !user.phoneNumbers.includes(phoneNumber)) {
			throw new Error('Phone number does not exist in your account.');
		}

		// Regular phone number deletion (non-primary only)
		const updatedUser = await this.userModel.findByIdAndUpdate(
			userId,
			{ $pull: { phoneNumbers: phoneNumber } },
			{ new: true },
		);

		if (!updatedUser) throw new EntityNotFound(User);
		return updatedUser;
	}

	async getUserById(userId: string): Promise<User | null> {
		return await this.userModel.findById(userId);
	}
	async updatePassword(userId: string, password: string) {
		await this.userModel.findByIdAndUpdate(userId, { password: password }, { new: true });
		return {
			success: true,
			message: 'Password updated successfully',
		};
	}
	async getAllUsers(): Promise<User[]> {
		return await this.userModel.find();
	}
	async checkPassword(userId: string, password: string): Promise<boolean> {
		const user = await this.userModel.findById(userId);
		if (!user) throw new EntityNotFound(User);
		return await bcrypt.compare(password, user.password || '');
	}
	async search(query: any): Promise<User[]> {
		if (!query || query.trim() === '') return [];
		// console.log('User Repository - Received query:', query);
		return await this.userModel.find({
			fullName: { $regex: query, $options: 'i' },
		});
	}
}
