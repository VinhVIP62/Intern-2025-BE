import Joi from 'joi';

interface DbVars {
	readonly uri: string;
	readonly maxPoolSize?: number;
	readonly minPoolSize?: number;
	readonly maxIdleTimeMS?: number;
	readonly waitQueueTimeoutMS?: number;
	readonly maxConnecting?: number;
	readonly serverSelectionTimeoutMS?: number;
	readonly socketTimeoutMS?: number;
	readonly connectTimeoutMS?: number;
	readonly heartbeatFrequencyMS?: number;
}

interface JwtVars {
	accessSecret: string;
	refreshSecret: string;
	accessTokenExpiration: string | number;
	refreshTokenExpiration: string | number;
}

interface ThrottlerVars {
	ttl: number;
	limit: number;
}

interface EmailVars {
	host: string;
	port: number;
	secure: boolean;
	user: string;
	pass: string;
	from: string;
}

interface CloudinaryVars {
	cloud_name: string;
	api_key: string;
	api_secret: string;
}

export interface IEnvVars {
	readonly env: 'development' | 'production';
	readonly port: number;
	readonly database: DbVars;
	readonly jwt: JwtVars;
	readonly throttler: ThrottlerVars;
	readonly email: EmailVars;
	readonly cloudinary: CloudinaryVars;
	readonly corsOrigins: string[];
}

// env validation schema for Joi
const envFileSchema = Joi.object<IEnvVars, true>({
	env: Joi.string().valid('development', 'production').default('development'),
	port: Joi.number().default(3000),
	database: Joi.object<DbVars, true>({
		uri: Joi.string().uri().required(),
		maxPoolSize: Joi.number().default(10),
		minPoolSize: Joi.number().default(2),
		maxIdleTimeMS: Joi.number().default(30000),
		waitQueueTimeoutMS: Joi.number().default(2500),
		maxConnecting: Joi.number().default(2),
		serverSelectionTimeoutMS: Joi.number().default(5000),
		socketTimeoutMS: Joi.number().default(45000),
		connectTimeoutMS: Joi.number().default(10000),
		heartbeatFrequencyMS: Joi.number().default(10000),
	}).required(),
	jwt: Joi.object<JwtVars, true>({
		accessSecret: Joi.string().required(),
		refreshSecret: Joi.string().required(),
		accessTokenExpiration: Joi.alternatives(Joi.number(), Joi.string()).default('15m'),
		refreshTokenExpiration: Joi.alternatives(Joi.number(), Joi.string()).default('7d'),
	}).required(),
	throttler: Joi.object<ThrottlerVars, true>({
		ttl: Joi.number().default(60),
		limit: Joi.number().default(10),
	}).required(),
	email: Joi.object<EmailVars, true>({
		host: Joi.string().required(),
		port: Joi.number().required(),
		secure: Joi.boolean().default(false),
		user: Joi.string().required(),
		pass: Joi.string().required(),
		from: Joi.string().required(),
	}).required(),
	cloudinary: Joi.object<CloudinaryVars, true>({
		cloud_name: Joi.string().required(),
		api_key: Joi.string().required(),
		api_secret: Joi.string().required(),
	}).required(),
	corsOrigins: Joi.array()
		.items(Joi.string())
		.default([
			'http://localhost:3000',
			'http://localhost:5173',
			'https://alobo-sport-hub.onrender.com',
		]),
});

// map your env vars to ConfigService's properties
const loadEnv = () => ({
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	database: {
		uri: process.env.DATABASE_URI,
		maxPoolSize: process.env.DB_MAX_POOL_SIZE,
		minPoolSize: process.env.DB_MIN_POOL_SIZE,
		maxIdleTimeMS: process.env.DB_MAX_IDLE_TIME_MS,
		waitQueueTimeoutMS: process.env.DB_WAIT_QUEUE_TIMEOUT_MS,
		maxConnecting: process.env.DB_MAX_CONNECTING,
		serverSelectionTimeoutMS: process.env.DB_SERVER_SELECTION_TIMEOUT_MS,
		socketTimeoutMS: process.env.DB_SOCKET_TIMEOUT_MS,
		connectTimeoutMS: process.env.DB_CONNECT_TIMEOUT_MS,
		heartbeatFrequencyMS: process.env.DB_HEARTBEAT_FREQUENCY_MS,
	},
	jwt: {
		accessSecret: process.env.JWT_SECRET,
		refreshSecret: process.env.JWT_REFRESH_SECRET,
		accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
		refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
	},
	throttler: {
		ttl: process.env.THROTTLE_TTL,
		limit: process.env.THROTTLE_LIMIT,
	},
	email: {
		host: process.env.EMAIL_HOST,
		port: Number(process.env.EMAIL_PORT),
		secure: process.env.EMAIL_SECURE === 'true',
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
		from: process.env.EMAIL_FROM,
	},
	cloudinary: {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	},
	corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],
});

// validate and optionally transform your env variables here
export default (): IEnvVars => {
	const env = loadEnv();

	// Debug: Log để kiểm tra file .env nào đang được sử dụng
	console.log('🔍 Environment Debug:');
	console.log('NODE_ENV:', process.env.NODE_ENV);
	console.log('PORT:', process.env.PORT);
	console.log('DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set');

	const valResult = envFileSchema.validate(env, { abortEarly: false });

	if (valResult.error) {
		throw new Error('env file validation error: ' + valResult.error.message);
	}

	return valResult.value;
};

// inject ConfigService<IEnvVars> to load typed env variables
