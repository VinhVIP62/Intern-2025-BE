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

interface ThrottlerVars {
	ttl: number;
	limit: number;
}

export interface IEnvVars {
	readonly env: 'development' | 'production';
	readonly port: number;
	readonly database: DbVars;
	readonly jwt: JwtVars;
	readonly throttler: ThrottlerVars;
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
	throttler: Joi.object<ThrottlerVars, true>({
		ttl: Joi.number().default(60),
		limit: Joi.number().default(10),
	}).required(),
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
	throttler: {
		ttl: process.env.THROTTLE_TTL,
		limit: process.env.THROTTLE_LIMIT,
	},
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
