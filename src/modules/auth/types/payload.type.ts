export type Payload = {
	email?: string;
	sub: {
		id: string;
		roles: string[];
	};
};
