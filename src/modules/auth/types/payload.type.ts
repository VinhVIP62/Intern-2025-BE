export type TokenType = 'access' | 'refresh' | 'temp' | 'reset';

export interface AccessPayload {
	sub: string; // userId
	email: string;
	roles: string[];
	type: 'access';
}

export interface TempPayload {
	sub: string; // email
	verifiedEmail: boolean;
	type: 'temp';
}

export interface RefreshPayload {
	sub: string;
	email: string;
	roles: string[];
	type: 'refresh';
}

export type ResetPayload = {
	sub: string;
	email: string;
	type: 'reset';
};

export interface Payload {
	sub: string;
	email: string;
	roles: string[];
}

export type JwtPayload = AccessPayload | TempPayload | RefreshPayload | ResetPayload;
