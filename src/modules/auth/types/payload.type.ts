export type Sub = {
	id: string;
	roles: string[];
	hasFinishedSetup: boolean;
};

export type Payload = {
	username?: string;
	sub: Sub;
};
