import { Role } from '@common/enum/roles.enum';
import { Injectable } from '@nestjs/common';

interface User {
	_id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	roles: Role[];
	refreshToken?: string;
}

@Injectable()
export class UserService {
	private users: User[] = [];

	async findByEmail(email: string): Promise<User | null> {
		return await new Promise(r => r(this.users.find(user => user.email === email) || null));
	}

	async findById(id: string): Promise<User | null> {
		return await new Promise(r => r(this.users.find(user => user._id === id) || null));
	}

	async create(userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		refreshToken?: string;
	}): Promise<User> {
		const newUser: User = {
			_id: Math.random().toString(36).substring(2, 9), // Generate random ID
			...userData,
			roles: [Role.USER], // Default role using enum
		};

		this.users.push(newUser);
		console.log('The new user is: ', newUser);
		return await new Promise(r => r(newUser));
	}

	async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
		const user = await this.findById(userId);
		if (user) {
			user.refreshToken = refreshToken;
		}
	}

	async findByRefreshToken(refreshToken: string): Promise<User | null> {
		return await new Promise(r =>
			r(this.users.find(user => user.refreshToken === refreshToken) || null),
		);
	}
}
