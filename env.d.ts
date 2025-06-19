/// <reference types="node" />

// Declare env variables here.

declare namespace NodeJS {
	interface ProcessEnv {
		readonly NODE_ENV: 'development' | 'production' | 'test';
		readonly PORT: number;
		readonly DATABASE_URI: string;
		// Database connection pooling and timeout configurations
		readonly DB_MAX_POOL_SIZE?: string;
		readonly DB_MIN_POOL_SIZE?: string;
		readonly DB_MAX_IDLE_TIME_MS?: string;
		readonly DB_WAIT_QUEUE_TIMEOUT_MS?: string;
		readonly DB_MAX_CONNECTING?: string;
		readonly DB_SERVER_SELECTION_TIMEOUT_MS?: string;
		readonly DB_SOCKET_TIMEOUT_MS?: string;
		readonly DB_CONNECT_TIMEOUT_MS?: string;
		readonly DB_HEARTBEAT_FREQUENCY_MS?: string;
		readonly JWT_SECRET: string;
		readonly JWT_REFRESH_SECRET: string;
		readonly JWT_ACCESS_TOKEN_EXPIRATION: string | number;
		readonly JWT_REFRESH_TOKEN_EXPIRATION: string | number;
		readonly THROTTLE_TTL: number;
		readonly THROTTLE_LIMIT: number;
	}
}
