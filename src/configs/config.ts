import Joi from 'joi';

export interface IEnvVars {
  readonly env: 'development' | 'production';
  readonly port: number;
}

// env validation schema for Joi
const envFileSchema = Joi.object<IEnvVars, true>({
  env: Joi.string().valid('development', 'production').default('development'),
  port: Joi.number().default(3000),
});

// map your env vars to ConfigService's properties
const loadEnv = () => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
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
