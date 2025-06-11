import { Options } from 'pino-http';

export const pinoHttpConfig: Options = {
    autoLogging: false,
    transport: {
        target: 'pino-pretty',
        options: {
            singleLine: true,
            colorize: true,
            ignore: 'req.headers,req.query,req.params,host,pid',
            translateTime: 'SYS:standard',
        },
    },
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
};
