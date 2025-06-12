/// <reference types="node" />

// Declare env variables here.

declare namespace NodeJS {
	interface ProcessEnv {
		readonly NODE_ENV: 'development' | 'production' | 'test';
		readonly PORT: number;
		readonly DATABASE_URI: string;
		readonly JWT_ACCESS_TOKEN_EXPIRATION: string | number;
		readonly JWT_REFRESH_TOKEN_EXPIRATION: string | number;
	}
}
