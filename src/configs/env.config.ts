import Joi, { ValidationError, ValidationResult } from 'joi';

interface DbVars {
	readonly uri: string;
}

interface JwtVars {
	accessSecret: string;
	refreshSecret: string;
	accessTokenExpiration: string | number;
	refreshTokenExpiration: string | number;
}

export interface IEnvVars {
	readonly env: 'development' | 'production';
	readonly port: number;
	readonly corsOrigin: string;
	readonly throttlerTtl: number;
	readonly throttlerLimit: number;
	readonly database: DbVars;
	readonly jwt: JwtVars;
}

// Joi validation schema
const envFileSchema = Joi.object<IEnvVars, true>({
	env: Joi.string().valid('development', 'production').default('development'),
	port: Joi.number().default(3000),

	corsOrigin: Joi.string().default('*'),
	throttlerTtl: Joi.number().default(60),
	throttlerLimit: Joi.number().default(10),

	database: Joi.object<DbVars, true>({
		uri: Joi.string().uri().required(),
	}).required(),

	jwt: Joi.object<JwtVars, true>({
		accessSecret: Joi.string().required(),
		refreshSecret: Joi.string().required(),
		accessTokenExpiration: Joi.alternatives(Joi.number(), Joi.string()).default('15m'),
		refreshTokenExpiration: Joi.alternatives(Joi.number(), Joi.string()).default('7d'),
	}).required(),
});

// Map raw env vars to internal structure
const loadEnv = (): unknown => ({
	env: process.env.NODE_ENV as 'development' | 'production',
	port: Number(process.env.PORT ?? 3000),

	corsOrigin: process.env.CORS_ORIGIN ?? '*',
	throttlerTtl: parseInt(process.env.THROTTLER_TTL ?? '60', 10),
	throttlerLimit: parseInt(process.env.THROTTLER_LIMIT ?? '10', 10),

	database: {
		uri: process.env.DATABASE_URI ?? '',
	},

	jwt: {
		accessSecret: process.env.JWT_SECRET,
		refreshSecret: process.env.JWT_REFRESH_SECRET,
		accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
		refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
	},
});

// Validate and export
export default (): IEnvVars => {
	const env = loadEnv();
	const result: ValidationResult<IEnvVars> = envFileSchema.validate(env, { abortEarly: false });

	if (result.error) {
		const message =
			result.error instanceof ValidationError ? result.error.message : 'Unknown validation error';
		throw new Error(`env file validation error: ${message}`);
	}

	return result.value;
};
