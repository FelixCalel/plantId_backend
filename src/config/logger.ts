import { createLogger, format, transports } from 'winston';
import { envs } from './envs';
import path from 'path';
import fs from 'fs';


if (envs.NODE_ENV === 'production') {
    const logDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
}

const consoleFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) =>
        `${timestamp} ${level} › ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`,
    ),
);

const jsonFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
);

const loggerTransports = [
    new transports.Console({
        level: envs.NODE_ENV === 'development' ? 'debug' : 'info',
        format: consoleFormat,
    }),
];

export const logger = createLogger({
    level: 'info',
    format: jsonFormat,
    defaultMeta: { service: 'plantid-backend' },
    transports: loggerTransports,
});