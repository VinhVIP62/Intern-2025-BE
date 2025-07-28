import { User } from '../entities';

export type UserRegister = Pick<
	User,
	'username' | 'password' | 'mail' | 'phone' | 'hasFinishedSetup'
>;
export type UserGoogleRegister = Pick<
	User,
	'avatarUrl' | 'username' | 'password' | 'mail' | 'googleLoginInfo' | 'hasFinishedSetup'
>;
