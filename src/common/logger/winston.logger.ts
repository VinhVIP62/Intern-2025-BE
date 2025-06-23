import { utilities } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');

export const winstonLogger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			level: process.env.LOG_LEVEL || 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				utilities.format.nestLike('MyApp', {
					colors: true,
					prettyPrint: true,
				}),
			),
		}),
		new winston.transports.File({
			dirname: logDir,
			filename: 'app.log',
			level: process.env.LOG_LEVEL || 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				utilities.format.nestLike('MyApp', {
					colors: false,
					prettyPrint: false,
				}),
			),
		}),
		new winston.transports.File({
			dirname: logDir,
			filename: 'error.log',
			level: 'error',
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
		}),
	],
});
