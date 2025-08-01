import { z } from 'zod/v4';

const dbVarsSchema = z.object({
	uri: z.url(),
});

const jwtVarsSchema = z.object({
	accessSecret: z.string(),
	refreshSecret: z.string(),
	accessTokenExpiration: z.union([z.string(), z.coerce.number()]).default('15m'),
	refreshTokenExpiration: z.union([z.string(), z.coerce.number()]).default('7d'),
});

const googleOAuth2VarsSchema = z.object({
	clientId: z.string(),
	secret: z.string(),
});

const redisVarsSchema = z.object({
	uri: z.string(),
});

export const envFileSchema = z.object({
	env: z.union([z.literal('development'), z.literal('production')]),
	port: z.coerce.number().default(3000),
	database: dbVarsSchema,
	jwt: jwtVarsSchema,
	googleOAuth2: googleOAuth2VarsSchema,
	redis: redisVarsSchema,
	imgKitKey: z.string(),
});

export type IEnvVars = z.infer<typeof envFileSchema>;

// map your env vars to ConfigService's properties
const loadEnv = (): IEnvVars => ({
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
	googleOAuth2: {
		clientId: process.env.GOOGLE_OA2_CLIENT_ID,
		secret: process.env.GOOGLE_OA2_CLIENT_SECRET,
	},
	imgKitKey: Buffer.from(process.env.IMGKIT_API_PRIVATE_KEY + ':').toString('base64'),
	redis: {
		uri: process.env.REDIS_URI,
	},
});

// validate and optionally transform your env variables here
export default (): IEnvVars => {
	const env = loadEnv();
	const valResult = envFileSchema.parse(env);
	return valResult;
};

// inject ConfigService<IEnvVars> to load typed env variables
