import Joi from 'joi';

interface DbVars {
	readonly uri: string;
}

interface JwtVars {
	accessSecret: string;
	refreshSecret: string;
	accessTokenExpiration: string | number;
	refreshTokenExpiration: string | number;
}

interface ElasticsearchVars {
	readonly host: string;
}

export interface IEnvVars {
	readonly env: 'development' | 'production';
	readonly port: number;
	readonly database: DbVars;
	readonly jwt: JwtVars;
	readonly cors?: string;
	readonly throttle_ttl?: number;
	readonly throttle_limit?: number;
	readonly upstash_redis_rest_url?: string;
	readonly upstash_redis_rest_token?: string;
	// readonly elasticsearch: ElasticsearchVars;
}

// env validation schema for Joi
const envFileSchema = Joi.object<IEnvVars, true>({
	env: Joi.string().valid('development', 'production').default('development'),
	port: Joi.number().default(3000),
	database: Joi.object<DbVars, true>({
		uri: Joi.string().uri().required(),
	}).required(),
	jwt: Joi.object<JwtVars, true>({
		accessSecret: Joi.string().required(),
		refreshSecret: Joi.string().required(),
		accessTokenExpiration: Joi.alternatives(Joi.number(), Joi.string()).default('15m'),
		refreshTokenExpiration: Joi.alternatives(Joi.number(), Joi.string()).default('7d'),
	}).required(),
	// elasticsearch: Joi.object<ElasticsearchVars, true>({
	// 	host: Joi.string().uri().required(),
	// }).required(),
	cors: Joi.string().uri().optional(),
	throttle_ttl: Joi.number().default(60000), // 1 minute
	throttle_limit: Joi.number().default(50),
	upstash_redis_rest_url: Joi.string().uri().optional(),
	upstash_redis_rest_token: Joi.string().optional(),
});

// map your env vars to ConfigService's properties
const loadEnv = () => ({
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	database: {
		uri: process.env.DATABASE_URI,
	},
	jwt: {
		accessSecret: process.env.JWT_SECRET,
		refreshSecret: process.env.JWT_REFRESH_SECRET,
		accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
		refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
	},
	cors: process.env.CORS,
	throttle_ttl: process.env.THROTTLE_TTL,
	throttle_limit: process.env.THROTTLE_LIMIT,
	upstash_redis_rest_url: process.env.UPSTASH_REDIS_REST_URL,
	upstash_redis_rest_token: process.env.UPSTASH_REDIS_REST_TOKEN,
	// elasticsearch: {
	// 	host: process.env.ELASTICSEARCH_HOST,
	// },
});

// validate and optionally transform your env variables here
export default (): IEnvVars => {
	const env = loadEnv();
	const valResult = envFileSchema.validate(env, { abortEarly: false });

	if (valResult.error) {
		throw new Error('env file validation error: ' + valResult.error.message);
	}

	return valResult.value;
};

// inject ConfigService<IEnvVars> to load typed env variables
