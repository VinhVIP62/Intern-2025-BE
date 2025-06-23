export type Payload = {
	email?: string;
	phoneNumber?: string;
	sub: {
		id: string;
		roles: string[];
	};
};
