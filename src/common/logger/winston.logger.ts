import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const WinstonLogger = WinstonModule.createLogger({
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(({ timestamp, level, message }) => {
					return `[${String(timestamp)}] ${String(level).toUpperCase()}: ${String(message)}`;
				}),
				utilities.format.nestLike('MyApp', {
					colors: true,
					prettyPrint: true,
					processId: true,
					appName: true,
				}),
			),
		}),
	],
});
