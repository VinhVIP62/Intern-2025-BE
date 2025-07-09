export type Payload = {
	username?: string;
	sub: {
		id: string;
		roles: string[];
	};
};
