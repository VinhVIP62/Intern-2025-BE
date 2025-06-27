export type Payload = {
	email?: string;
	sub: {
		id: number;
		roles: string[];
	};
};
